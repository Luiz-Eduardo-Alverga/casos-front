/**
 * Regras da lista editável de stakeholders (aba Stakes). Sem React: conversões, status da linha,
 * validação do Salvar, repetidos, totais e TSV (copiar/colar). Decisões #16 a #29 de docs/projetos.
 */
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import { parseSgpHorasToMinutes } from "@/components/projetos/edicao/stakes/utils";
import { stakeLinhaSchema } from "@/components/projetos/edicao/stakes/stakes-lista-schema";
import type {
  StakeLinha,
  StakeLinhaCampo,
  StakeLinhaErros,
  StakeLinhaImportada,
  StakeLinhaStatus,
  StakesCatalogos,
  StakesTotais,
} from "@/components/projetos/edicao/stakes/stakes-lista.types";

export const MSG_COLABORADOR_REPETIDO = "Colaborador já está em outra linha";
export const MSG_COLABORADOR_FORA_DA_LISTA = "Escolha um colaborador da lista";
export const MSG_COLABORADOR_AMBIGUO = "Mais de um colaborador com esse nome";
export const MSG_SEM_TABULACAO = "colunas não estão separadas por tabulação";
export const DIAS_PADRAO_PRIMEIRA_LINHA = "10";

export const TSV_CABECALHO = [
  "Função",
  "Colaborador",
  "Planejada",
  "Não planejada",
  "Dias",
  "Observação",
] as const;

let contadorChave = 0;

/** Chave estável para uma linha nova na tela. */
export function novaChaveLinha(): string {
  contadorChave += 1;
  return `nova-${Date.now().toString(36)}-${contadorChave}`;
}

// ---------------------------------------------------------------------------
// Horas
// ---------------------------------------------------------------------------

export function minutosParaHoras(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** `HH:MM` (minutos < 60) → minutos; `null` se o texto não estiver nesse formato. */
export function horasParaMinutos(hhmm: string): number | null {
  const match = hhmm.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Lê horas escritas de várias formas (colagem/Excel): `6`, `06`, `6:00`, `6h`, `6h30`,
 * `06,30`, `0630`. Vazio vira `00:00`. Devolve `HH:MM` ou `null` se não der para entender.
 */
export function lerHorasTolerante(valor: string): string | null {
  const texto = valor.trim().toLowerCase().replace(/\s+/g, "");
  if (!texto) return "00:00";

  let horas: number;
  let minutos: number;

  const comSeparador = texto.match(/^(\d{1,2})[:h,.](\d{0,2})(?:m(?:in)?)?$/);
  if (comSeparador) {
    horas = Number(comSeparador[1]);
    const mm = comSeparador[2];
    minutos = mm === "" ? 0 : Number(mm.length === 1 ? `${mm}0` : mm);
  } else if (/^\d{1,2}$/.test(texto)) {
    horas = Number(texto);
    minutos = 0;
  } else if (/^\d{3,4}$/.test(texto)) {
    horas = Number(texto.slice(0, texto.length - 2));
    minutos = Number(texto.slice(-2));
  } else {
    return null;
  }

  if (minutos >= 60 || horas > 99) return null;
  return minutosParaHoras(horas * 60 + minutos);
}

// ---------------------------------------------------------------------------
// Conversões e status
// ---------------------------------------------------------------------------

/** Ordem de inclusão: `sequencia` crescente (decisão #29). */
export function ordenarStakesPorInclusao(stakes: SgpStakeItem[]): SgpStakeItem[] {
  return [...stakes].sort((a, b) => a.sequencia - b.sequencia);
}

export function stakeToLinha(stake: SgpStakeItem): StakeLinha {
  return {
    key: `seq-${stake.sequencia}`,
    sequencia: stake.sequencia,
    idTipo: stake.id_tipo != null ? String(stake.id_tipo) : "",
    colaboradorId: stake.suporte_id != null ? String(stake.suporte_id) : "",
    colaboradorLabel: stake.nomes?.trim() ?? "",
    planejada: minutosParaHoras(parseSgpHorasToMinutes(stake.horas_disponiveis)),
    naoPlanejada: minutosParaHoras(
      parseSgpHorasToMinutes(stake.horas_nao_planejadas),
    ),
    dias: stake.dias_uteis != null ? String(stake.dias_uteis) : "",
    observacao: stake.observacoes?.trim() ?? "",
    problemaImportacao: null,
  };
}

/** Linha nova no fim: dias da linha anterior, horas zeradas (decisão #23). */
export function novaLinha(anterior?: StakeLinha | null): StakeLinha {
  return {
    key: novaChaveLinha(),
    sequencia: null,
    idTipo: "",
    colaboradorId: "",
    colaboradorLabel: "",
    planejada: "00:00",
    naoPlanejada: "00:00",
    dias: anterior?.dias?.trim() || DIAS_PADRAO_PRIMEIRA_LINHA,
    observacao: "",
    problemaImportacao: null,
  };
}

function minutosComparaveis(hhmm: string): number | string {
  return horasParaMinutos(hhmm) ?? hhmm.trim();
}

/** A linha difere do que está gravado? (compara valores normalizados) */
export function linhaAlterada(linha: StakeLinha, original: SgpStakeItem): boolean {
  const gravada = stakeToLinha(original);
  return (
    linha.idTipo !== gravada.idTipo ||
    linha.colaboradorId !== gravada.colaboradorId ||
    minutosComparaveis(linha.planejada) !== minutosComparaveis(gravada.planejada) ||
    minutosComparaveis(linha.naoPlanejada) !==
      minutosComparaveis(gravada.naoPlanejada) ||
    linha.dias.trim() !== gravada.dias.trim() ||
    linha.observacao.trim() !== gravada.observacao.trim()
  );
}

export function statusLinha(
  linha: StakeLinha,
  originais: Map<number, SgpStakeItem>,
): StakeLinhaStatus {
  if (linha.sequencia == null) return "nova";
  const original = originais.get(linha.sequencia);
  if (!original) return "nova";
  return linhaAlterada(linha, original) ? "alterada" : "salva";
}

export function contarNaoSalvas(
  linhas: StakeLinha[],
  originais: Map<number, SgpStakeItem>,
): number {
  return linhas.filter((l) => statusLinha(l, originais) !== "salva").length;
}

// ---------------------------------------------------------------------------
// Totais
// ---------------------------------------------------------------------------

/** (planejada + não planejada) × dias, em minutos; `null` se algum campo não fecha. */
export function totalLinhaMin(linha: StakeLinha): number | null {
  const p = horasParaMinutos(linha.planejada);
  const np = horasParaMinutos(linha.naoPlanejada);
  const dias = /^\d+$/.test(linha.dias.trim()) ? Number(linha.dias) : null;
  if (p == null || np == null || dias == null) return null;
  return (p + np) * dias;
}

export function totaisLinhas(linhas: StakeLinha[]): StakesTotais {
  let planejadasMin = 0;
  let naoPlanejadasMin = 0;
  for (const linha of linhas) {
    const dias = /^\d+$/.test(linha.dias.trim()) ? Number(linha.dias) : 0;
    planejadasMin += (horasParaMinutos(linha.planejada) ?? 0) * dias;
    naoPlanejadasMin += (horasParaMinutos(linha.naoPlanejada) ?? 0) * dias;
  }
  return {
    pessoas: linhas.length,
    planejadasMin,
    naoPlanejadasMin,
    totalMin: planejadasMin + naoPlanejadasMin,
  };
}

// ---------------------------------------------------------------------------
// Validação do Salvar (decisões #19 e #20)
// ---------------------------------------------------------------------------

function adicionarErro(
  erros: StakeLinhaErros,
  campo: StakeLinhaCampo | null,
  mensagem: string,
) {
  if (campo) erros.campos[campo] = true;
  if (!erros.mensagens.includes(mensagem)) erros.mensagens.push(mensagem);
}

/** Índices das linhas cujo colaborador aparece em outra linha da lista. */
export function indicesColaboradorRepetido(linhas: StakeLinha[]): Set<number> {
  const porColaborador = new Map<string, number[]>();
  linhas.forEach((linha, i) => {
    const id = linha.colaboradorId.trim();
    if (!id) return;
    porColaborador.set(id, [...(porColaborador.get(id) ?? []), i]);
  });
  const repetidos = new Set<number>();
  for (const indices of porColaborador.values()) {
    if (indices.length > 1) indices.forEach((i) => repetidos.add(i));
  }
  return repetidos;
}

export function validarLinha(
  linha: StakeLinha,
  catalogos: StakesCatalogos,
): StakeLinhaErros {
  const erros: StakeLinhaErros = { campos: {}, mensagens: [] };

  const parsed = stakeLinhaSchema.safeParse(linha);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const campo = issue.path[0] as StakeLinhaCampo | undefined;
      const conhecido =
        campo === "idTipo" ||
        campo === "colaboradorId" ||
        campo === "planejada" ||
        campo === "naoPlanejada" ||
        campo === "dias";
      adicionarErro(erros, conhecido ? campo : null, issue.message);
    }
  }

  const idTipo = Number(linha.idTipo);
  if (linha.idTipo && !catalogos.tipos.has(idTipo)) {
    adicionarErro(erros, "idTipo", "Escolha a função");
  }
  const idColaborador = Number(linha.colaboradorId);
  if (linha.colaboradorId && !catalogos.colaboradores.has(idColaborador)) {
    adicionarErro(erros, "colaboradorId", MSG_COLABORADOR_FORA_DA_LISTA);
  }

  return erros;
}

export interface ResultadoValidacaoSalvar {
  /** Erros por `key` da linha (só linhas novas/alteradas são validadas). */
  erros: Map<string, StakeLinhaErros>;
  /** Linhas a enviar, na ordem da lista. */
  aSalvar: StakeLinha[];
}

export function validarParaSalvar(
  linhas: StakeLinha[],
  originais: Map<number, SgpStakeItem>,
  catalogos: StakesCatalogos,
): ResultadoValidacaoSalvar {
  const erros = new Map<string, StakeLinhaErros>();
  const aSalvar: StakeLinha[] = [];
  const repetidos = indicesColaboradorRepetido(linhas);

  linhas.forEach((linha, i) => {
    if (statusLinha(linha, originais) === "salva") return;
    aSalvar.push(linha);
    const errosLinha = validarLinha(linha, catalogos);
    if (repetidos.has(i)) {
      adicionarErro(errosLinha, "colaboradorId", MSG_COLABORADOR_REPETIDO);
    }
    if (errosLinha.mensagens.length > 0) erros.set(linha.key, errosLinha);
  });

  return { erros, aSalvar };
}

// ---------------------------------------------------------------------------
// TSV: copiar (decisão #24) e colar (decisão #25)
// ---------------------------------------------------------------------------

function limparCelulaTsv(valor: string): string {
  return valor.replace(/[\t\r\n]+/g, " ").trim();
}

/** Linhas preenchidas (com função ou colaborador) como TSV com cabeçalho. */
export function gerarTsv(linhas: StakeLinha[], tipos: Map<number, string>): string {
  const corpo = linhas
    .filter((l) => l.idTipo || l.colaboradorId || l.colaboradorLabel.trim())
    .map((l) =>
      [
        tipos.get(Number(l.idTipo)) ?? "",
        l.colaboradorLabel,
        l.planejada,
        l.naoPlanejada,
        l.dias,
        l.observacao,
      ]
        .map(limparCelulaTsv)
        .join("\t"),
    );
  return [TSV_CABECALHO.join("\t"), ...corpo].join("\n");
}

export function contarLinhasTsv(tsv: string): number {
  return Math.max(0, tsv.split("\n").length - 1);
}

export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Texto tem cara de linhas copiadas (pelo menos uma tabulação)? */
export function pareceTsv(texto: string): boolean {
  return texto.includes("\t");
}

function indexarPorNome(mapa: Map<number, string>): Map<string, number[]> {
  const indice = new Map<string, number[]>();
  for (const [id, nome] of mapa) {
    const chave = normalizarTexto(nome);
    if (!chave) continue;
    indice.set(chave, [...(indice.get(chave) ?? []), id]);
  }
  return indice;
}

function ehCabecalho(colunas: string[]): boolean {
  const primeira = normalizarTexto(colunas[0] ?? "");
  return primeira === "funcao" || primeira === "papel";
}

/**
 * Lê texto colado (Excel, Access ou "Copiar linhas"). Colunas por posição: Função, Colaborador,
 * Planejada, Não planejada, Dias, Observação. Cabeçalho opcional. Cada linha vira uma linha nova
 * com o primeiro problema encontrado (a linha pode ser importada e entra com o erro marcado).
 */
export function lerTsv(
  texto: string,
  catalogos: StakesCatalogos,
): StakeLinhaImportada[] {
  const tiposPorNome = indexarPorNome(catalogos.tipos);
  const colaboradoresPorNome = indexarPorNome(catalogos.colaboradores);

  const linhasTexto = texto
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (linhasTexto.length > 0 && ehCabecalho(linhasTexto[0].split("\t"))) {
    linhasTexto.shift();
  }

  return linhasTexto.map((textoLinha, i) => {
    const numero = i + 1;
    const linha = novaLinha();
    linha.dias = "";

    if (!textoLinha.includes("\t")) {
      linha.colaboradorLabel = textoLinha.trim();
      return {
        numero,
        linha: { ...linha, problemaImportacao: MSG_SEM_TABULACAO },
        problema: MSG_SEM_TABULACAO,
        bloqueio: null,
      };
    }

    const [funcao = "", colaborador = "", planejada = "", naoPlanejada = "", dias = "", observacao = ""] =
      textoLinha.split("\t").map((c) => c.trim());
    const problemas: string[] = [];

    const tipoIds = tiposPorNome.get(normalizarTexto(funcao)) ?? [];
    if (tipoIds.length === 1) linha.idTipo = String(tipoIds[0]);
    else problemas.push(funcao ? `Função "${funcao}" não encontrada` : "Escolha a função");

    linha.colaboradorLabel = colaborador;
    const colaboradorIds = colaboradoresPorNome.get(normalizarTexto(colaborador)) ?? [];
    if (colaboradorIds.length === 1) {
      linha.colaboradorId = String(colaboradorIds[0]);
      linha.colaboradorLabel =
        catalogos.colaboradores.get(colaboradorIds[0]) ?? colaborador;
    } else {
      problemas.push(
        colaboradorIds.length > 1 ? MSG_COLABORADOR_AMBIGUO : MSG_COLABORADOR_FORA_DA_LISTA,
      );
    }

    const p = lerHorasTolerante(planejada);
    if (p) linha.planejada = p;
    else {
      linha.planejada = planejada;
      problemas.push(`Planejada "${planejada}" não é uma hora válida`);
    }
    const np = lerHorasTolerante(naoPlanejada);
    if (np) linha.naoPlanejada = np;
    else {
      linha.naoPlanejada = naoPlanejada;
      problemas.push(`Não planejada "${naoPlanejada}" não é uma hora válida`);
    }

    linha.dias = dias.replace(/\s+/g, "");
    if (!/^\d+$/.test(linha.dias) || Number(linha.dias) < 1) {
      problemas.push(dias ? `Dias "${dias}" não é um número inteiro` : "Informe os dias");
    }

    linha.observacao = observacao;
    const problema = problemas[0] ?? null;
    return {
      numero,
      linha: { ...linha, problemaImportacao: problema },
      problema,
      bloqueio: null,
    };
  });
}

/** Stakes de outro projeto como linhas novas para o Importar (decisão #26). */
export function stakesParaImportadas(
  stakes: SgpStakeItem[],
  catalogos: StakesCatalogos,
): StakeLinhaImportada[] {
  return ordenarStakesPorInclusao(stakes).map((stake, i) => {
    const base = stakeToLinha(stake);
    const colaboradorConhecido = catalogos.colaboradores.has(stake.suporte_id);
    const problema = colaboradorConhecido ? null : MSG_COLABORADOR_FORA_DA_LISTA;
    return {
      numero: i + 1,
      linha: {
        ...base,
        key: novaChaveLinha(),
        sequencia: null,
        colaboradorId: colaboradorConhecido ? base.colaboradorId : "",
        problemaImportacao: problema,
      },
      problema,
      bloqueio: null,
    };
  });
}

/**
 * Marca repetidos (decisão #20): quem já está na lista do projeto fica "Já está no projeto";
 * quem aparece de novo na própria importação fica "Repetido nesta lista" (a primeira passa).
 */
export function marcarBloqueios(
  importadas: StakeLinhaImportada[],
  linhasDoProjeto: StakeLinha[],
): StakeLinhaImportada[] {
  const noProjeto = new Set(
    linhasDoProjeto.map((l) => l.colaboradorId.trim()).filter(Boolean),
  );
  const vistos = new Set<string>();
  return importadas.map((item) => {
    const id = item.linha.colaboradorId.trim();
    let bloqueio: StakeLinhaImportada["bloqueio"] = null;
    if (id && noProjeto.has(id)) bloqueio = "Já está no projeto";
    else if (id && vistos.has(id)) bloqueio = "Repetido nesta lista";
    if (id) vistos.add(id);
    return { ...item, bloqueio };
  });
}

// ---------------------------------------------------------------------------
// Sincronização com o servidor
// ---------------------------------------------------------------------------

/**
 * Junta a lista da tela com o que veio do servidor (depois de salvar, excluir ou recarregar):
 * linha gravada sem mudança local vira a versão do servidor; linha com mudança local
 * (comparada com `originaisAnteriores`) é mantida; linha excluída no servidor sai; linhas novas
 * continuam no fim. A ordem segue a inclusão (decisão #29).
 */
export function mesclarComServidor(
  linhasAtuais: StakeLinha[],
  stakesServidor: SgpStakeItem[],
  originaisAnteriores: Map<number, SgpStakeItem>,
): StakeLinha[] {
  const atuaisPorSequencia = new Map<number, StakeLinha>();
  for (const linha of linhasAtuais) {
    if (linha.sequencia != null) atuaisPorSequencia.set(linha.sequencia, linha);
  }

  const gravadas = ordenarStakesPorInclusao(stakesServidor).map((stake) => {
    const atual = atuaisPorSequencia.get(stake.sequencia);
    if (!atual) return stakeToLinha(stake);
    const anterior = originaisAnteriores.get(stake.sequencia);
    const temMudancaLocal = anterior ? linhaAlterada(atual, anterior) : false;
    return temMudancaLocal ? atual : stakeToLinha(stake);
  });

  const novas = linhasAtuais.filter((l) => l.sequencia == null);
  return [...gravadas, ...novas];
}
