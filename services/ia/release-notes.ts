import { fetchWithAuth } from "@/lib/fetch";
import type {
  ReleaseNotesData,
  ReleaseNotesDeltaEvent,
  ReleaseNotesDoneEvent,
  ReleaseNotesProgressEvent,
  ReleaseNotesResponse,
  ReleaseNotesStreamErrorEvent,
} from "@/lib/types/release-notes";

function liberacaoVaziaMessage(status: number, message: string): string {
  if (
    status === 404 &&
    /nenhum item marcado como liberado/i.test(message)
  ) {
    return "Nenhum caso foi marcado como pronto para liberação neste registro ainda.";
  }
  return message;
}

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

    throw new Error(liberacaoVaziaMessage(response.status, message));
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

export type StreamReleaseNotesOptions = {
  onProgress?: (event: ReleaseNotesProgressEvent) => void;
  onDelta?: (chunk: string) => void;
  signal?: AbortSignal;
};

function parseSseBlock(
  block: string,
): { event: string; data: string } | null {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

export async function streamReleaseNotes(
  liberacaoId: number | string,
  options: StreamReleaseNotesOptions = {},
): Promise<ReleaseNotesData> {
  const { onProgress, onDelta, signal } = options;

  const url = new URL(
    `/api/release-notes/${encodeURIComponent(String(liberacaoId))}/stream`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "GET",
    headers: { Accept: "text/event-stream" },
    signal,
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const json = (await response.json().catch(
      () => ({}),
    )) as ReleaseNotesResponse;
    const message =
      json.error ||
      json.message ||
      "Erro ao gerar registro de liberação com IA";
    throw new Error(liberacaoVaziaMessage(response.status, message));
  }

  if (!contentType.includes("text/event-stream") || !response.body) {
    throw new Error("Resposta de progresso inválida do servidor.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: ReleaseNotesData | null = null;

  const handleEvent = (eventName: string, rawData: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      throw new Error("Evento de progresso inválido recebido do servidor.");
    }

    if (eventName === "progress") {
      onProgress?.(parsed as ReleaseNotesProgressEvent);
      return;
    }

    if (eventName === "delta") {
      const delta = parsed as ReleaseNotesDeltaEvent;
      if (typeof delta.chunk !== "string") {
        throw new Error("Evento delta inválido recebido do servidor.");
      }
      onDelta?.(delta.chunk);
      return;
    }

    if (eventName === "done") {
      const done = parsed as ReleaseNotesDoneEvent;
      if (!done.success || !done.data) {
        throw new Error(
          done.error ||
            done.message ||
            "Erro ao gerar registro de liberação com IA",
        );
      }
      result = done.data;
      return;
    }

    if (eventName === "error") {
      const err = parsed as ReleaseNotesStreamErrorEvent;
      throw new Error(
        err.error ||
          err.message ||
          "Erro ao gerar registro de liberação com IA",
      );
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const parsed = parseSseBlock(part);
        if (!parsed) continue;
        handleEvent(parsed.event, parsed.data);
        if (result) {
          await reader.cancel().catch(() => undefined);
          return result;
        }
      }
    }

    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) {
        handleEvent(parsed.event, parsed.data);
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    throw error;
  }

  if (!result) {
    throw new Error(
      "A geração foi interrompida antes de concluir o registro de liberação.",
    );
  }

  return result;
}
