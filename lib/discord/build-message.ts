import type { CasoDiscordNotifyInput } from "@/lib/discord/types";

const DEFAULT_CASOS_BASE_URL =
  "https://softflow.softcom.services/casos";

function formatPrioridade(prioridade: number): string {
  if (prioridade != null && prioridade > 0) return String(prioridade);
  return "—";
}

function formatVersao(versao: string | undefined): string {
  const v = String(versao ?? "").trim();
  return v || "—";
}

export function buildCasoDiscordMessage(
  input: CasoDiscordNotifyInput,
  extras: {
    produtoLabel: string;
    projetoLabel: string;
    abertoPor: string | null;
  },
): string {
  const baseUrl =
    process.env.CASOS_APP_BASE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_CASOS_BASE_URL;
  const link = `${baseUrl}/${input.registro}`;
  const origem = input.origem ?? "criado";

  const tituloEvento =
    origem === "clonado"
      ? "Caso Clonado"
      : origem === "report"
        ? "Novo Report Aberto"
        : "Novo Caso Aberto";

  const linkLabel =
    origem === "report" ? "Abrir report no Softflow" : "Abrir no Softflow";

  const linhas = [
    `🔔 **${tituloEvento}** • \`#${input.registro}\``,
    "",
    `* **Produto:** \`${extras.produtoLabel}\``,
    `* **Versão:** \`${formatVersao(input.versaoProduto)}\``,
    `* **Projeto:** \`${extras.projetoLabel}\``,
    `* **Prioridade:** ${formatPrioridade(input.prioridade)}`,
    `* **Resumo:** ${input.descricaoResumo?.trim() || "—"}`,
    "",
    `👤 **Aberto por:** ${extras.abertoPor ?? "—"}`,
    `🔗 [${linkLabel}](${link})`,
  ];

  return linhas.join("\n");
}
