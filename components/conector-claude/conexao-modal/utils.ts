import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  ClaudeConexao,
  TipoClienteConexao,
} from "@/services/conector-claude/conexao";

/** Ordem e nomes dos tipos de cliente no modal (decisão #25). */
export const TIPOS_CONEXAO: TipoClienteConexao[] = ["claude", "claude-code"];

export const NOME_CONEXAO: Record<TipoClienteConexao, string> = {
  claude: "Claude (app e web)",
  "claude-code": "Claude Code",
};

/** Comando que adiciona o conector no Claude Code. */
export function comandoClaudeCode(endereco: string): string {
  return `claude mcp add --transport http softflow ${endereco}`;
}

/** "Desde 19/11/2026 16:50 · usado há 5 minutos" (ou "ainda não usado"). */
export function resumoConexao(conexao: ClaudeConexao): string {
  const desde = format(new Date(conexao.conectadoEm), "dd/MM/yyyy HH:mm");
  const uso = conexao.ultimoUsoEm
    ? `usado ${formatDistanceToNow(new Date(conexao.ultimoUsoEm), {
        addSuffix: true,
        locale: ptBR,
      })}`
    : "ainda não usado";
  return `Desde ${desde} · ${uso}`;
}
