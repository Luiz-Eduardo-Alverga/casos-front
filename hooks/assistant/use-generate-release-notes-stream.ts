"use client";

import { useCallback, useRef, useState } from "react";
import { streamReleaseNotes } from "@/services/ia/release-notes";
import type {
  ReleaseNotesData,
  ReleaseNotesProgressEvent,
} from "@/lib/types/release-notes";

export function useGenerateReleaseNotesStream() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ReleaseNotesProgressEvent | null>(
    null,
  );
  const [draftMarkdown, setDraftMarkdown] = useState("");
  const [resultado, setResultado] = useState<ReleaseNotesData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (liberacaoId: number | string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setProgress(null);
    setDraftMarkdown("");
    setError(null);
    setResultado(null);

    try {
      const data = await streamReleaseNotes(liberacaoId, {
        signal: controller.signal,
        onProgress: (event) => {
          if (!controller.signal.aborted) {
            setProgress(event);
          }
        },
        onDelta: (chunk) => {
          if (!controller.signal.aborted) {
            setDraftMarkdown((prev) => prev + chunk);
          }
        },
      });

      if (controller.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      setResultado(data);
      setDraftMarkdown("");
      setProgress(null);
      return data;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      const nextError =
        err instanceof Error
          ? err
          : new Error("Erro ao gerar registro de liberação com IA.");
      setError(nextError);
      throw nextError;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsGenerating(false);
      }
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
  }, []);

  return {
    generate,
    abort,
    isGenerating,
    progress,
    draftMarkdown,
    resultado,
    error,
  };
}
