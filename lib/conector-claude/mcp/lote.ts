import { api } from "@/lib/axios";
import { criarCaso } from "@/lib/casos/criar-caso";
import { PREVIA_TTL_MS } from "@/lib/conector-claude/config";
import { gerarTokenAleatorio } from "@/lib/conector-claude/crypto";
import { comTokenDaConexao } from "@/lib/conector-claude/legacy-token";
import {
  getPreviaDaConexao,
  insertPrevia,
  PREVIA_ABRINDO,
  reservarPreviaParaAbertura,
  setPreviaCasoRegistro,
  setPreviaPayload,
} from "@/lib/db/claude-conector";
import { temPermissao, type ConectorSession } from "@/lib/api-db/with-conector-permission";
import type { AuthorizationHeader } from "@/lib/auxiliar/catalogos";
import {
  criarCatalogosCache,
  erroDaApi,
  linkDoCaso,
  resolverCaso,
  type CasoCreatePayload,
  type PrepararCasoInput,
  type ResumoPrevia,
} from "./caso";

export const MIN_CASOS_LOTE = 2;
export const MAX_CASOS_LOTE = 15;
/** Tipos de relação do legado (`TIPO_RELACAO_CASO_LABEL`). */
const RELACAO_E_PAI_DE = 1;
const RELACAO_E_FILHO_DE = 2;
/** Marca trocada pelo número do pai na abertura (o pai novo só existe depois de aberto). */
const MARCA_PAI = "{{PAI}}";

const s = (v: unknown) => (v == null ? "" : String(v).trim());

/** Campos iguais para todos os casos do lote (os opcionais seguem os padrões da tela). */
export interface ComumLote {
  produto_id: string;
  versao: string;
  projeto_id: string;
  dev_id: string;
  qa_id?: string;
  modulo?: string;
  importancia?: string;
  categoria_id?: string;
  origem_id?: string;
  relator_id?: string;
  nao_planejado?: boolean;
}

export interface ParteLoteInput {
  titulo: string;
  descricao: string;
  informacoes_adicionais?: string;
  dev_id?: string;
  qa_id?: string;
  modulo?: string;
  importancia?: string;
  nao_planejado?: boolean;
}

export interface PrepararCasosInput {
  pai: { registro?: string; novo?: { resumo?: string; descricao: string; informacoes_adicionais?: string } };
  comum: ComumLote;
  titulo_base: string;
  casos: ParteLoteInput[];
}

/** Payload gravado na prévia do lote, com o andamento da abertura (decisão #29). */
export interface PayloadLote {
  tituloBase: string;
  pai: { registro: number; resumo: string } | { novo: CasoCreatePayload; resumo: string };
  partes: { titulo: string; payload: CasoCreatePayload; naoPlanejado: boolean }[];
  progresso: {
    pai?: number;
    partes: { registro?: number; filho?: boolean; pai?: boolean }[];
  };
}

/** "PARTE 01/12": zero à esquerda com 10 ou mais casos (decisão #28). */
export function rotuloParte(n: number, total: number): string {
  const casas = total >= 10 ? 2 : 1;
  return `PARTE ${String(n).padStart(casas, "0")}/${String(total).padStart(casas, "0")}`;
}

/** `<titulo_base> — PARTE <n>/<N> — <titulo>` (decisão #28). */
export function tituloDaParte(tituloBase: string, n: number, total: number, titulo: string): string {
  return `${tituloBase.trim()} — ${rotuloParte(n, total)} — ${titulo.trim()}`;
}

/** Lista das partes no fim da descrição do pai novo, sem números (o pai abre antes; decisão #27). */
export function descricaoDoPai(descricao: string, titulos: string[]): string {
  const lista = titulos.map((t, i) => `${rotuloParte(i + 1, titulos.length)} — ${t.trim()}`);
  return [descricao.trim(), "", "Partes deste caso (abertas como casos filhos, na ordem de execução):", ...lista].join("\n");
}

const linhaOrigemLote = (nome: string, total: number, pai: string) =>
  `Aberto pelo Claude (conector Softflow) por ${nome} (lote de ${total} casos, pai ${pai}).`;
const linhaOrigemPai = (nome: string, total: number) =>
  `Aberto pelo Claude (conector Softflow) por ${nome} (caso pai de um lote de ${total} casos).`;

const valorCampo = (r: ResumoPrevia, campo: string) => r.campos.find((c) => c.campo === campo)?.valor ?? "-";

/** O que a parte sobrepõe de `comum`, para a prévia mostrar. */
function sobreposicoes(p: ParteLoteInput): string[] {
  const out: string[] = [];
  if (s(p.dev_id)) out.push("dev");
  if (s(p.qa_id)) out.push("QA");
  if (s(p.modulo)) out.push("módulo");
  if (s(p.importancia)) out.push("importância");
  if (p.nao_planejado !== undefined) out.push("não planejado");
  return out;
}

async function buscarPaiExistente(auth: AuthorizationHeader, registro: string) {
  try {
    const r = await api.get(`/projeto-memoria/${encodeURIComponent(registro)}`, { headers: auth });
    const caso = r.data?.data?.caso;
    if (!caso?.id) return null;
    return { registro: Number(caso.id), resumo: s(caso.textos?.descricao_resumo) };
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

/** `softflow_preparar_casos`: uma prévia para o lote inteiro (decisões #27 a #29). */
export async function prepararCasos(session: ConectorSession, input: PrepararCasosInput) {
  const { appUser, permissions } = session;
  const total = input.casos.length;
  const tituloBase = s(input.titulo_base);
  const registroPai = s(input.pai?.registro);
  const paiNovo = input.pai?.novo;

  return comTokenDaConexao(session.conexao, async (auth) => {
    const cat = criarCatalogosCache(auth, appUser.legacyUserId);
    const pendenciasGerais: string[] = [];
    if (!tituloBase) pendenciasGerais.push("titulo_base vazio.");
    if (!!registroPai === !!paiNovo) {
      pendenciasGerais.push('Informe o caso pai: { "registro": <n> } para um caso existente ou { "novo": {...} } para abrir um junto.');
    }

    // Campos comuns resolvidos uma vez: a tabela "Campos comuns" e as pendências deles.
    const comumInput: PrepararCasoInput = { ...input.comum, resumo: tituloBase || "-", descricao: "-" };
    const base = await resolverCaso(session, cat, comumInput);
    const pendenciasComuns = new Set(base.resumo.pendencias);

    // Pai.
    let pai: PayloadLote["pai"] | null = null;
    let paiResumo: ResumoPrevia | null = null;
    const pendenciasPai: string[] = [];
    if (registroPai && !paiNovo) {
      if (!temPermissao(permissions, "list-case")) {
        pendenciasPai.push("Seu perfil não permite consultar casos, então não dá para usar um pai existente.");
      } else {
        const achado = await buscarPaiExistente(auth, registroPai);
        if (achado) pai = achado;
        else pendenciasPai.push(`Caso pai ${registroPai} não encontrado.`);
      }
    } else if (paiNovo && !registroPai) {
      const titulos = input.casos.map((c) => s(c.titulo));
      const r = await resolverCaso(
        session,
        cat,
        {
          ...input.comum,
          resumo: s(paiNovo.resumo) || tituloBase,
          descricao: descricaoDoPai(String(paiNovo.descricao ?? ""), titulos),
          informacoes_adicionais: paiNovo.informacoes_adicionais,
        },
        { linhaOrigem: linhaOrigemPai(appUser.nome, total) },
      );
      paiResumo = r.resumo;
      pai = { novo: r.payload, resumo: r.resumo.resumo };
      pendenciasPai.push(...r.resumo.pendencias.filter((p) => !pendenciasComuns.has(p)));
      if (!String(paiNovo.descricao ?? "").trim()) pendenciasPai.push("Descrição do pai vazia.");
    }
    const marcaPai = pai && "registro" in pai ? String(pai.registro) : MARCA_PAI;

    // Partes, na ordem.
    const partes: PayloadLote["partes"] = [];
    const linhasPartes: string[] = [];
    const pendenciasPartes: string[] = [];
    for (const [i, c] of input.casos.entries()) {
      const titulo = tituloDaParte(tituloBase, i + 1, total, s(c.titulo));
      const r = await resolverCaso(
        session,
        cat,
        {
          ...input.comum,
          resumo: titulo,
          descricao: c.descricao,
          informacoes_adicionais: c.informacoes_adicionais,
          ...(s(c.dev_id) ? { dev_id: s(c.dev_id) } : {}),
          ...(s(c.qa_id) ? { qa_id: s(c.qa_id) } : {}),
          ...(s(c.modulo) ? { modulo: s(c.modulo) } : {}),
          ...(s(c.importancia) ? { importancia: s(c.importancia) } : {}),
          ...(c.nao_planejado !== undefined ? { nao_planejado: c.nao_planejado } : {}),
        },
        { linhaOrigem: linhaOrigemLote(appUser.nome, total, marcaPai) },
      );
      partes.push({ titulo, payload: r.payload, naoPlanejado: r.resumo.naoPlanejado });
      const proprias = r.resumo.pendencias.filter((p) => !pendenciasComuns.has(p));
      if (!s(c.titulo)) proprias.push("Título vazio.");
      pendenciasPartes.push(...proprias.map((p) => `${rotuloParte(i + 1, total)}: ${p}`));
      const sob = sobreposicoes(c);
      linhasPartes.push(
        `- ${titulo}`,
        `  dev ${valorCampo(r.resumo, "Dev atribuído")} · QA ${valorCampo(r.resumo, "QA atribuído")}${
          r.resumo.naoPlanejado ? " · não planejado" : ""
        }${sob.length ? ` · sobrepõe: ${sob.join(", ")}` : ""}`,
      );
    }

    const pendencias = [
      ...pendenciasGerais,
      ...[...pendenciasComuns].filter((p) => p !== "Descrição vazia."),
      ...pendenciasPai.map((p) => `Pai: ${p}`),
      ...pendenciasPartes,
    ];

    const codigo = `pl_${gerarTokenAleatorio(9)}`;
    const payload: PayloadLote = {
      tituloBase,
      pai: pai ?? { registro: 0, resumo: "" },
      partes,
      progresso: { partes: partes.map(() => ({})) },
    };
    await insertPrevia({
      id: codigo,
      conexaoId: session.conexao.id,
      tipo: "lote",
      payload: payload as unknown as Record<string, unknown>,
      resumo: { pendencias, total } as unknown as Record<string, unknown>,
      expiraEm: new Date(Date.now() + PREVIA_TTL_MS),
    });

    const linhas = [
      `Prévia do lote de ${total} casos (código ${codigo}, vale 15 minutos). Nada foi criado ainda.`,
      "",
      "Campos comuns:",
      ...base.resumo.campos.map((c) => `- ${c.campo}: ${c.valor}${c.padrao ? " [padrão]" : ""}`),
      `- Não planejado: ${base.resumo.naoPlanejado ? "sim (o dev recebe DM no Discord)" : "não"}`,
      "",
      "Caso pai:",
      pai && "registro" in pai && pai.registro
        ? `- Existente: #${pai.registro} · ${pai.resumo || "(sem resumo)"} · ${linkDoCaso(pai.registro)} (título e descrição não mudam; ganha as relações "É PAI DE")`
        : pai && "novo" in pai
          ? `- Novo: ${pai.resumo}\n  Descrição:\n  ${(paiResumo?.descricao ?? "").replace(/\n/g, "\n  ")}`
          : "- (não resolvido)",
      "",
      "Partes, na ordem de execução (cada uma vira filha do pai, \"É FILHO DE\"):",
      ...linhasPartes,
    ];
    if (pendencias.length) {
      linhas.push("", "Falta resolver (uma pendência bloqueia o lote inteiro; corrija e gere outra prévia):");
      linhas.push(...pendencias.map((p) => `- ${p}`));
    } else {
      linhas.push(
        "",
        `Mostre esta prévia à pessoa (com a descrição de cada parte, se ela quiser ver) e, só depois de ela confirmar, chame softflow_abrir_casos com codigo_previa "${codigo}". Para ajustar algo, gere uma prévia nova.`,
      );
    }
    return linhas.join("\n");
  });
}

function textoDoAndamento(p: PayloadLote, paiRegistro: number | undefined): string[] {
  const total = p.partes.length;
  const linhas: string[] = [];
  if (paiRegistro) {
    const novo = "novo" in p.pai;
    linhas.push(`Pai: #${paiRegistro}${novo ? " (aberto agora)" : " (já existia)"} · ${p.pai.resumo} · ${linkDoCaso(paiRegistro)}`);
  }
  p.partes.forEach((parte, i) => {
    const pr = p.progresso.partes[i] ?? {};
    if (!pr.registro) return;
    const rel = [pr.filho ? "É FILHO DE" : "", pr.pai ? "É PAI DE no pai" : ""].filter(Boolean).join(" + ");
    linhas.push(`${rotuloParte(i + 1, total)}: #${pr.registro} · ${parte.titulo} · ${linkDoCaso(pr.registro)}${rel ? ` · relações: ${rel}` : ""}`);
  });
  return linhas;
}

/**
 * `softflow_abrir_casos`: abre o pai (se novo) e as partes na ordem, cria as relações nos dois
 * sentidos (o legado não cria o inverso; conferido na Parte 3) e grava cada passo na prévia. Falhou
 * no meio: chamar de novo com o mesmo código continua de onde parou (decisão #29).
 */
export async function abrirCasos(session: ConectorSession, codigoPrevia: string): Promise<{ erro: boolean; texto: string }> {
  const codigo = codigoPrevia.trim();
  const previa = await getPreviaDaConexao(codigo, session.conexao.id);
  if (!previa) {
    return { erro: true, texto: `Prévia "${codigoPrevia}" não encontrada para esta conexão. Gere uma prévia com softflow_preparar_casos.` };
  }
  if (previa.tipo !== "lote") {
    return { erro: true, texto: "Esta prévia é de um caso só. Use softflow_abrir_caso com este código." };
  }
  const p = previa.payload as unknown as PayloadLote;
  const total = p.partes.length;
  if (previa.casoRegistro != null && previa.casoRegistro > 0) {
    return {
      erro: false,
      texto: [`Este lote já foi aberto (nenhum caso novo foi criado).`, ...textoDoAndamento(p, previa.casoRegistro)].join("\n"),
    };
  }
  if (previa.casoRegistro === PREVIA_ABRINDO) {
    return { erro: false, texto: "A abertura deste lote já está em andamento. Aguarde e chame de novo com o mesmo código para ver o resultado." };
  }
  const comecou = Boolean(p.progresso.pai) || p.progresso.partes.some((x) => x.registro);
  if (!comecou && previa.expiraEm.getTime() < Date.now()) {
    return { erro: true, texto: "A prévia venceu (15 minutos). Gere uma prévia nova com softflow_preparar_casos e confirme com a pessoa." };
  }
  const pendencias = ((previa.resumo as { pendencias?: string[] }).pendencias ?? []);
  if (pendencias.length) {
    return { erro: true, texto: `A prévia tem pendências e não pode ser aberta:\n${pendencias.map((x) => `- ${x}`).join("\n")}` };
  }
  if (!(await reservarPreviaParaAbertura(previa.id))) {
    return abrirCasos(session, codigoPrevia);
  }

  const salvar = () => setPreviaPayload(previa.id, p as unknown as Record<string, unknown>);
  let paiRegistro: number | undefined = "registro" in p.pai ? p.pai.registro : p.progresso.pai;
  let etapa = "";
  try {
    await comTokenDaConexao(session.conexao, async (auth) => {
      if (!paiRegistro && "novo" in p.pai) {
        etapa = "abrir o caso pai";
        const r = await criarCaso(auth, p.pai.novo);
        if (r.registro == null) throw new Error("o Softflow respondeu sem o número do caso pai; confira no Softflow antes de tentar de novo");
        paiRegistro = r.registro;
        p.progresso.pai = r.registro;
        await salvar();
      }
      const pai = paiRegistro!;
      for (const [i, parte] of p.partes.entries()) {
        const pr = (p.progresso.partes[i] ??= {});
        const rotulo = rotuloParte(i + 1, total);
        if (!pr.registro) {
          etapa = `abrir a ${rotulo}`;
          const body: CasoCreatePayload = {
            ...parte.payload,
            InformacoesAdicionais: s(parte.payload.InformacoesAdicionais).replaceAll(MARCA_PAI, String(pai)),
          };
          const r = await criarCaso(auth, body);
          if (r.registro == null) throw new Error(`o Softflow respondeu sem o número da ${rotulo}; confira no Softflow antes de tentar de novo`);
          pr.registro = r.registro;
          await salvar();
        }
        if (!pr.filho) {
          etapa = `ligar a ${rotulo} ao pai (É FILHO DE)`;
          await api.post(
            "/projeto-casos-relacoes",
            { registro: pr.registro, tipo_relacao: RELACAO_E_FILHO_DE, caso_relacionado: pai, descricao_resumo: `${rotulo} de: ${p.tituloBase}` },
            { headers: auth },
          );
          pr.filho = true;
          await salvar();
        }
        if (!pr.pai) {
          etapa = `ligar o pai à ${rotulo} (É PAI DE)`;
          await api.post(
            "/projeto-casos-relacoes",
            { registro: pai, tipo_relacao: RELACAO_E_PAI_DE, caso_relacionado: pr.registro, descricao_resumo: parte.titulo },
            { headers: auth },
          );
          pr.pai = true;
          await salvar();
        }
      }
    });
    await setPreviaCasoRegistro(previa.id, paiRegistro!);
    console.info(
      `[conector-claude] Lote aberto: pai=${paiRegistro} partes=${p.progresso.partes.map((x) => x.registro).join(",")} conexao=${session.conexao.id} app_user=${session.appUser.id}`,
    );
    const dm = p.partes.some((x) => x.naoPlanejado) ? " Os devs das partes não planejadas recebem a DM no Discord." : "";
    return {
      erro: false,
      texto: [`Lote de ${total} casos aberto.${dm}`, ...textoDoAndamento(p, paiRegistro)].join("\n"),
    };
  } catch (error) {
    await salvar().catch(() => undefined);
    await setPreviaCasoRegistro(previa.id, null);
    console.error(`[conector-claude] Falha no lote ${previa.id} ao ${etapa}:`, error);
    const motivo = error instanceof Error && !("response" in error) ? error.message : erroDaApi(error, "erro");
    const feito = textoDoAndamento(p, paiRegistro);
    return {
      erro: true,
      texto: [
        `O lote parou ao ${etapa}: ${motivo}.`,
        feito.length ? "Já feito:" : "Nada foi criado.",
        ...feito,
        "",
        `Corrigido o motivo, chame softflow_abrir_casos de novo com codigo_previa "${codigo}": o lote continua de onde parou, sem abrir de novo o que já foi aberto.`,
      ].join("\n"),
    };
  }
}
