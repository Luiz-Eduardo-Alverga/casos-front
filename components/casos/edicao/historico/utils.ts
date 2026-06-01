import type { CasoHistoricoItem } from "@/services/projeto-casos/get-historico";

export type HistoricoTipoAlteracao = "novo_valor" | "valor_anterior";

export interface HistoricoCampoAlterado {
  campo: string;
  tipo: HistoricoTipoAlteracao;
  valor: string;
}

/** Verbos conhecidos no texto de histórico da API (ex.: criação vs alteração). */
const RE_VERBO_CAMPO = "(?:Alterado|Criado)";
const RE_VALOR_ANTERIOR = new RegExp(
  `^${RE_VERBO_CAMPO} Campo \\[(.+?)\\],\\s*valor anterior\\s*->\\s*(.*)$`,
  "i",
);
const RE_NOVO_VALOR = new RegExp(
  `^${RE_VERBO_CAMPO} Campo \\[(.+?)\\]\\s*->\\s*(.*)$`,
  "i",
);

export function formatarDataHistorico(valor: string | null | undefined): string {
  if (!valor?.trim()) return "—";
  const match = valor
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return valor;
  const [, ano, mes, dia, hora, minuto, segundo] = match;
  return `${dia}/${mes}/${ano} às ${hora}:${minuto}:${segundo}`;
}

function normalizarQuebrasDeLinha(texto: string): string {
  return texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export interface ParseHistoricoCamposResult {
  campos: HistoricoCampoAlterado[];
  /** Linhas iniciais (antes do primeiro campo reconhecido) que não casaram com o padrão. */
  textoNaoParseado?: string;
}

export function parseHistoricoCampos(texto: string): ParseHistoricoCamposResult {
  if (!texto?.trim()) return { campos: [] };
  const linhas = normalizarQuebrasDeLinha(texto).split("\n");
  const campos: HistoricoCampoAlterado[] = [];
  const linhasNaoParseadasPrefixo: string[] = [];
  let atual: HistoricoCampoAlterado | null = null;

  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trimEnd();
    const anteriorMatch = linha.match(RE_VALOR_ANTERIOR);
    const novoMatch = linha.match(RE_NOVO_VALOR);

    if (anteriorMatch || novoMatch) {
      if (atual) campos.push(atual);
      const match = anteriorMatch ?? novoMatch;
      const tipo: HistoricoTipoAlteracao = anteriorMatch
        ? "valor_anterior"
        : "novo_valor";
      atual = {
        campo: match?.[1]?.trim() || "Campo",
        tipo,
        valor: match?.[2] ?? "",
      };
      continue;
    }

    if (atual) {
      atual.valor = `${atual.valor}\n${linhaBruta}`;
    } else {
      linhasNaoParseadasPrefixo.push(linhaBruta);
    }
  }

  if (atual) campos.push(atual);

  const textoNaoParseadoRaw = linhasNaoParseadasPrefixo.join("\n").trim();
  const textoNaoParseado =
    textoNaoParseadoRaw.length > 0 ? textoNaoParseadoRaw : undefined;

  return { campos, textoNaoParseado };
}

export interface HistoricoEventoFormatado {
  seq: number;
  usuario: string;
  dataAlteracao: string;
  campos: HistoricoCampoAlterado[];
  /** Trecho do `historico` que não seguiu o padrão de linhas de campo. */
  textoNaoParseado?: string;
}

export function mapearHistoricoParaTimeline(
  itens: CasoHistoricoItem[],
): HistoricoEventoFormatado[] {
  return itens.map((item) => {
    const { campos, textoNaoParseado } = parseHistoricoCampos(
      item.historico ?? "",
    );
    return {
      seq: item.seq,
      usuario: item.usuario || "Usuário",
      dataAlteracao: formatarDataHistorico(item.data_alteracao),
      campos,
      textoNaoParseado,
    };
  });
}

