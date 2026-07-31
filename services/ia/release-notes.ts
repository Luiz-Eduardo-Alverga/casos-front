import { fetchWithAuth } from "@/lib/fetch";
import type {
  ReleaseNotesData,
  ReleaseNotesResponse,
} from "@/lib/types/release-notes";

export async function getReleaseNotes(
  liberacaoId: number | string,
): Promise<ReleaseNotesData> {
  const url = new URL(
    `/api/release-notes/${encodeURIComponent(String(liberacaoId))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });
  const json = (await response.json().catch(
    () => ({}),
  )) as ReleaseNotesResponse;

  if (!response.ok) {
    const message =
      json.error ||
      json.message ||
      "Erro ao gerar registro de liberação com IA";

    if (
      response.status === 404 &&
      /nenhum item marcado como liberado/i.test(message)
    ) {
      throw new Error(
        "Nenhum caso foi marcado como pronto para liberação neste registro ainda.",
      );
    }

    throw new Error(message);
  }

  if (!json.success || json.data === undefined) {
    throw new Error(
      json.error ||
        json.message ||
        "Erro ao gerar registro de liberação com IA",
    );
  }

  return json.data;
}
