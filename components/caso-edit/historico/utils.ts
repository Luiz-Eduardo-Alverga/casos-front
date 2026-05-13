import type { CasoHistoricoItem } from "@/services/projeto-casos/get-historico";

export type HistoricoTipoAlteracao = "novo_valor" | "valor_anterior";

export interface HistoricoCampoAlterado {
  campo: string;
  tipo: HistoricoTipoAlteracao;
  valor: string;
}

const RE_VALOR_ANTERIOR =
  /^Alterado Campo \[(.+?)\],\s*valor anterior\s*->\s*(.*)$/i;
const RE_NOVO_VALOR = /^Alterado Campo \[(.+?)\]\s*->\s*(.*)$/i;

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

export function parseHistoricoCampos(texto: string): HistoricoCampoAlterado[] {
  if (!texto?.trim()) return [];
  const linhas = normalizarQuebrasDeLinha(texto).split("\n");
  const campos: HistoricoCampoAlterado[] = [];
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
    }
  }

  if (atual) campos.push(atual);
  return campos;
}

export interface HistoricoEventoFormatado {
  seq: number;
  usuario: string;
  dataAlteracao: string;
  campos: HistoricoCampoAlterado[];
}

export function mapearHistoricoParaTimeline(
  itens: CasoHistoricoItem[],
): HistoricoEventoFormatado[] {
  return itens.map((item) => ({
    seq: item.seq,
    usuario: item.usuario || "Usuário",
    dataAlteracao: formatarDataHistorico(item.data_alteracao),
    campos: parseHistoricoCampos(item.historico),
  }));
}

