import { api } from "@/lib/axios";
import { buildCasoCreatePayload } from "@/lib/casos/payload";
import { criarCaso } from "@/lib/casos/criar-caso";
import { getPublicOrigin, PREVIA_TTL_MS } from "@/lib/conector-claude/config";
import { gerarTokenAleatorio } from "@/lib/conector-claude/crypto";
import { comTokenDaConexao } from "@/lib/conector-claude/legacy-token";
import {
  getPreviaDaConexao,
  insertPrevia,
  PREVIA_ABRINDO,
  reservarPreviaParaAbertura,
  setPreviaCasoRegistro,
} from "@/lib/db/claude-conector";
import type { ProjetoCasoCreateBody } from "@/lib/discord/parse-create-payload";
import type { ConectorSession } from "@/lib/api-db/with-conector-permission";
import type { Versao } from "@/services/auxiliar/versoes";
import {
  listarCategorias,
  listarImportancias,
  listarModulos,
  listarOrigens,
  listarPessoas,
  listarProdutos,
  listarProjetos,
  listarVersoes,
  normalizar,
} from "./catalogos";

/** Padrões iguais aos da tela `/casos/novo`. */
export const PADRAO_IMPORTANCIA = "3";
export const PADRAO_CATEGORIA = "4";
export const PADRAO_ORIGEM = "4";

export interface PrepararCasoInput {
  produto_id: string;
  versao: string;
  projeto_id: string;
  dev_id: string;
  resumo: string;
  descricao: string;
  importancia?: string;
  categoria_id?: string;
  origem_id?: string;
  relator_id?: string;
  modulo?: string;
  qa_id?: string;
  informacoes_adicionais?: string;
  nao_planejado?: boolean;
}

interface CampoResolvido {
  campo: string;
  valor: string;
  padrao?: boolean;
}

interface ResumoPrevia {
  campos: CampoResolvido[];
  pendencias: string[];
  naoPlanejado: boolean;
  resumo: string;
  descricao: string;
  informacoesAdicionais: string;
}

/** Linha de origem do caso (decisão #8). */
export function linhaOrigemClaude(nome: string): string {
  return `Aberto pelo Claude (conector Softflow) por ${nome}.`;
}

export function erroDaApi(error: unknown, padrao: string): string {
  const e = error as {
    response?: { status?: number; data?: { message?: string; error?: string; errors?: unknown } };
    message?: string;
  };
  const d = e?.response?.data;
  const detalhes =
    d?.errors && typeof d.errors === "object"
      ? Object.values(d.errors as Record<string, unknown>)
          .flat()
          .map(String)
          .join("; ")
      : "";
  return [d?.message || d?.error || padrao, detalhes].filter(Boolean).join(": ");
}

const s = (v: unknown) => (v == null ? "" : String(v).trim());

/**
 * Resolve e valida os campos, aplica os padrões e grava a prévia (15 min). Não cria nada.
 * Campo inválido não para a prévia: volta em "Falta resolver" (abrir recusa prévia com pendência).
 */
export async function prepararCaso(session: ConectorSession, input: PrepararCasoInput) {
  const { appUser } = session;
  const pendencias: string[] = [];
  const campos: CampoResolvido[] = [];

  return comTokenDaConexao(session.conexao, async (auth) => {
    const produtoId = s(input.produto_id);
    const [produtos, pessoas, categorias, origens, importancias] = await Promise.all([
      listarProdutos(auth),
      listarPessoas(auth),
      listarCategorias(auth),
      listarOrigens(auth),
      listarImportancias(auth),
    ]);

    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) campos.push({ campo: "Produto", valor: `${produto.nome} (${produto.id})` });
    else pendencias.push(`Produto ${produtoId || "(vazio)"} não encontrado. Use softflow_buscar_opcoes com tipo "produto".`);

    // Versão: aceita a sequência do catálogo ou o texto da versão.
    let versaoSeq = "";
    let versoes: Versao[] = [];
    if (produto) {
      const lista = await listarVersoes(auth, produto.id);
      versoes = lista.map((v) => ({ sequencia: v.id, versao: v.nome }) as Versao);
      const alvo = s(input.versao);
      const versao =
        lista.find((v) => v.id === alvo) ??
        lista.find((v) => normalizar(v.nome) === normalizar(alvo));
      if (versao) {
        versaoSeq = versao.id;
        campos.push({ campo: "Versão", valor: `${versao.nome} (${versao.id})` });
      } else {
        pendencias.push(`Versão "${alvo}" não está aberta no produto ${produto.nome}. Use softflow_buscar_opcoes com tipo "versao".`);
      }
    }

    let modulo = "";
    if (s(input.modulo)) {
      if (produto) {
        const modulos = await listarModulos(auth, produto.id);
        const m = modulos.find((x) => normalizar(x.nome) === normalizar(s(input.modulo)));
        if (m) {
          modulo = m.nome;
          campos.push({ campo: "Módulo", valor: m.nome });
        } else {
          pendencias.push(`Módulo "${s(input.modulo)}" não existe no produto ${produto.nome}.`);
        }
      }
    }

    const projetoId = s(input.projeto_id);
    let projetos = await listarProjetos(auth, appUser.legacyUserId, { setor: produto?.setor });
    let projeto = projetos.find((p) => p.id === projetoId);
    if (!projeto) {
      projetos = await listarProjetos(auth, appUser.legacyUserId);
      projeto = projetos.find((p) => p.id === projetoId);
    }
    if (projeto) campos.push({ campo: "Projeto", valor: `${projeto.nome} (${projeto.id})` });
    else pendencias.push(`Projeto ${projetoId || "(vazio)"} não encontrado entre os projetos disponíveis para você. Use softflow_buscar_opcoes com tipo "projeto".`);

    const pessoa = (id: string, rotulo: string, obrigatorio: boolean, padrao?: boolean) => {
      if (!id) {
        if (obrigatorio) pendencias.push(`${rotulo} não informado.`);
        return "";
      }
      const p = pessoas.find((x) => x.id === id);
      if (!p) {
        pendencias.push(`${rotulo}: pessoa ${id} não encontrada. Use softflow_buscar_opcoes com tipo "pessoa".`);
        return "";
      }
      campos.push({ campo: rotulo, valor: `${p.nome} (${p.id})`, padrao });
      return p.id;
    };
    const devId = pessoa(s(input.dev_id), "Dev atribuído", true);
    const qaId = pessoa(s(input.qa_id), "QA atribuído", false);
    const relatorInformado = s(input.relator_id);
    const relatorId = pessoa(
      relatorInformado || String(appUser.legacyUserId),
      "Relator",
      true,
      !relatorInformado,
    );

    const catalogo = (
      lista: { id: string; nome: string }[],
      valor: string | undefined,
      padrao: string,
      rotulo: string,
      tipo: string,
    ) => {
      const id = s(valor) || padrao;
      const item = lista.find((x) => x.id === id);
      if (!item) {
        pendencias.push(`${rotulo} ${id} não existe. Use softflow_buscar_opcoes com tipo "${tipo}".`);
        return "";
      }
      campos.push({ campo: rotulo, valor: `${item.nome} (${item.id})`, padrao: !s(valor) });
      return item.id;
    };
    const importancia = catalogo(importancias, input.importancia, PADRAO_IMPORTANCIA, "Importância", "importancia");
    const categoria = catalogo(categorias, input.categoria_id, PADRAO_CATEGORIA, "Categoria", "categoria");
    const origem = catalogo(origens, input.origem_id, PADRAO_ORIGEM, "Origem", "origem");

    const resumo = s(input.resumo);
    const descricao = String(input.descricao ?? "").trim();
    if (!resumo) pendencias.push("Resumo vazio.");
    if (!descricao) pendencias.push("Descrição vazia.");

    const extras = String(input.informacoes_adicionais ?? "").trim();
    const informacoesAdicionais = [extras, linhaOrigemClaude(appUser.nome)]
      .filter(Boolean)
      .join("\n\n");
    const naoPlanejado = input.nao_planejado === true;

    const payload = buildCasoCreatePayload({
      data: {
        produto: produto?.id ?? "",
        importancia,
        modulo,
        categoria,
        devAtribuido: devId,
        versao: versaoSeq,
        projeto: projeto?.id ?? "",
        origem,
        relator: relatorId,
        qaAtribuido: qaId,
        DescricaoResumo: resumo,
        DescricaoCompleta: descricao,
        InformacoesAdicionais: informacoesAdicionais,
      },
      naoPlanejado,
      userId: appUser.legacyUserId,
      versoes,
    });

    const resumoPrevia: ResumoPrevia = {
      campos,
      pendencias,
      naoPlanejado,
      resumo,
      descricao,
      informacoesAdicionais,
    };

    const codigo = `pv_${gerarTokenAleatorio(9)}`;
    await insertPrevia({
      id: codigo,
      conexaoId: session.conexao.id,
      payload: payload as unknown as Record<string, unknown>,
      resumo: resumoPrevia as unknown as Record<string, unknown>,
      expiraEm: new Date(Date.now() + PREVIA_TTL_MS),
    });

    return { codigo, texto: textoDaPrevia(codigo, resumoPrevia) };
  });
}

function textoDaPrevia(codigo: string, r: ResumoPrevia): string {
  const linhas = [
    `Prévia do caso (código ${codigo}, vale 15 minutos). Nada foi criado ainda.`,
    "",
    ...r.campos.map((c) => `- ${c.campo}: ${c.valor}${c.padrao ? " [padrão]" : ""}`),
    `- Não planejado: ${r.naoPlanejado ? "sim (o dev recebe DM no Discord)" : "não"}`,
    "",
    `Resumo: ${r.resumo || "(vazio)"}`,
    "",
    "Descrição:",
    r.descricao || "(vazia)",
    "",
    "Informações adicionais:",
    r.informacoesAdicionais,
  ];
  if (r.pendencias.length) {
    linhas.push("", "Falta resolver (a abertura será recusada até corrigir e gerar outra prévia):");
    linhas.push(...r.pendencias.map((p) => `- ${p}`));
  } else {
    linhas.push(
      "",
      `Mostre esta prévia à pessoa e, só depois de ela confirmar, chame softflow_abrir_caso com codigo_previa "${codigo}". Para ajustar algo, gere uma prévia nova.`,
    );
  }
  return linhas.join("\n");
}

export function linkDoCaso(registro: number | string): string {
  return `${getPublicOrigin()}/casos/${registro}`;
}

/**
 * Cria o caso exatamente com o payload da prévia (decisão #6). Código já usado devolve o mesmo
 * caso, sem criar outro.
 */
export async function abrirCaso(session: ConectorSession, codigoPrevia: string): Promise<string> {
  const previa = await getPreviaDaConexao(codigoPrevia.trim(), session.conexao.id);
  if (!previa) {
    return `Prévia "${codigoPrevia}" não encontrada para esta conexão. Gere uma prévia com softflow_preparar_caso.`;
  }
  if (previa.casoRegistro != null && previa.casoRegistro > 0) {
    return `Esta prévia já virou o caso ${previa.casoRegistro} (nenhum caso novo foi criado). Link: ${linkDoCaso(previa.casoRegistro)}`;
  }
  if (previa.casoRegistro === PREVIA_ABRINDO) {
    return "A abertura desta prévia já está em andamento. Aguarde alguns segundos e chame de novo com o mesmo código para ver o número do caso.";
  }
  if (previa.expiraEm.getTime() < Date.now()) {
    return "A prévia venceu (15 minutos). Gere uma prévia nova com softflow_preparar_caso e confirme com a pessoa.";
  }
  const resumo = previa.resumo as unknown as ResumoPrevia;
  if (resumo.pendencias?.length) {
    return `A prévia tem pendências e não pode ser aberta:\n${resumo.pendencias.map((p) => `- ${p}`).join("\n")}`;
  }

  if (!(await reservarPreviaParaAbertura(previa.id))) {
    return abrirCaso(session, codigoPrevia);
  }

  try {
    const body = previa.payload as unknown as ProjetoCasoCreateBody;
    const result = await comTokenDaConexao(session.conexao, (auth) => criarCaso(auth, body));
    if (result.registro == null) {
      await setPreviaCasoRegistro(previa.id, null);
      return "O Softflow respondeu sem o número do caso. Confira no Softflow antes de tentar de novo, para não duplicar.";
    }
    await setPreviaCasoRegistro(previa.id, result.registro);
    console.info(
      `[conector-claude] Caso aberto: registro=${result.registro} conexao=${session.conexao.id} app_user=${session.appUser.id}`,
    );
    const dm = resumo.naoPlanejado ? " O dev atribuído recebe a DM no Discord." : "";
    return `Caso ${result.registro} aberto.${dm} Link: ${linkDoCaso(result.registro)}`;
  } catch (error) {
    await setPreviaCasoRegistro(previa.id, null);
    console.error("[conector-claude] Falha ao abrir caso:", error);
    // Decisão #15: recusa do legado (ex.: tamanho) volta como mensagem; o Claude gera outra prévia.
    return `O Softflow recusou a abertura: ${erroDaApi(error, "erro ao criar caso")}. Ajuste e gere uma prévia nova.`;
  }
}

/** Resumo de um caso pelo número (`GET /projeto-memoria/{id}`). */
export async function consultarCaso(session: ConectorSession, registro: string): Promise<string> {
  const id = s(registro).replace(/^#/, "");
  if (!/^\d+$/.test(id)) return "Informe o número do caso (só dígitos).";
  try {
    const data = await comTokenDaConexao(session.conexao, async (auth) => {
      const r = await api.get(`/projeto-memoria/${id}`, { headers: auth });
      return r.data as { data?: Record<string, any> };
    });
    const item = data?.data;
    if (!item?.caso) return `Caso ${id} não encontrado.`;
    const { caso, produto, projeto } = item;
    const linhas = [
      `Caso ${caso.id}: ${s(caso.textos?.descricao_resumo) || "(sem resumo)"}`,
      `- Produto: ${s(produto?.nome)} (${s(produto?.id)}), versão ${s(produto?.versao) || "-"}`,
      `- Projeto: ${s(projeto?.descricao)} (${s(projeto?.id)})`,
      `- Status: ${s(caso.status?.descricao) || "-"}`,
      `- Dev: ${s(caso.usuarios?.desenvolvimento?.nome) || "-"}; QA: ${s(caso.usuarios?.qa?.nome) || "-"}`,
      `- Relator: ${s(caso.usuarios?.relator?.nome) || "-"}; aberto em ${s(caso.datas?.abertura).slice(0, 10) || "-"}`,
      `- Importância: ${s(caso.caracteristicas?.prioridade) || "-"}; categoria: ${s(caso.caracteristicas?.tipo_categoria) || "-"}`,
      `- Link: ${linkDoCaso(caso.id)}`,
    ];
    return linhas.join("\n");
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return `Caso ${id} não encontrado.`;
    return `Não foi possível consultar o caso ${id}: ${erroDaApi(error, "erro na consulta")}.`;
  }
}
