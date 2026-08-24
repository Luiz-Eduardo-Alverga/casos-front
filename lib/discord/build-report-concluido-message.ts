const DEFAULT_CASOS_BASE_URL = "https://softflow.softcom.services/casos";

export function buildReportConcluidoDiscordMessage(
  registro: number,
  ultimaAnotacao: string | null,
): string {
  const baseUrl =
    process.env.CASOS_APP_BASE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_CASOS_BASE_URL;
  const link = `${baseUrl}/${registro}`;
  const anotacao = ultimaAnotacao?.trim() || "";

  const linhas = [`🔔 **Report concluído** • \`#${registro}\``, ""];
  if (anotacao) {
    linhas.push(anotacao, "");
  }
  linhas.push(`🔗 [Abrir report no Softflow](${link})`);

  return linhas.join("\n");
}
