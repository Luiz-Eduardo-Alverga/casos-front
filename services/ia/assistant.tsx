import { apiAssistant } from "@/lib/axios";
import { fetchWithAuth } from "@/lib/fetch";

interface AssistantParams {
  description?: string;
  audio?: Blob;
  squadSetor?: string | null;
}

export interface AssistantResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    category: string;
    additionalInformation: string;
    product: {
      id: string;
      nome_projeto: string;
      setor: string;
    };
    users: [
      {
        id: string;
        nome_suporte: string;
        setor: string;
        usuario_discord: string;
      },
    ];
  };
  confidence?: number;
  processedIn?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ReportAnalysisParams {
  report: string;
  description: string;
}

export interface ReportAnalysisResponse {
  success: boolean;
  data: {
    analysis: string;
  };
  confidence?: number;
  processedIn?: string;
}

export async function checkAssistantHealth(): Promise<HealthResponse> {
  try {
    const response = await apiAssistant.get<HealthResponse>("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
}

export async function assistant({
  description,
  audio,
  squadSetor,
}: AssistantParams): Promise<AssistantResponse> {
  if (audio) {
    const formData = new FormData();

    if (description) {
      formData.append("description", description);
    }

    if (squadSetor) {
      formData.append("squadSetor", squadSetor);
    }

    const extension = audio.type.includes("webm")
      ? "webm"
      : audio.type.includes("mp3")
        ? "mp3"
        : audio.type.includes("wav")
          ? "wav"
          : "mp3";
    formData.append("audio", audio, `audio.${extension}`);

    const response = await fetchWithAuth("/api/assistant", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error?.error || error?.message || "Erro ao processar assistente",
      );
    }

    return (await response.json()) as AssistantResponse;
  }

  const response = await fetchWithAuth("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: description || "",
      ...(squadSetor ? { squadSetor } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao processar assistente",
    );
  }

  return (await response.json()) as AssistantResponse;
}

export async function reportAnalysis(
  params: ReportAnalysisParams,
): Promise<ReportAnalysisResponse> {
  try {
    const response = await apiAssistant.post<ReportAnalysisResponse>(
      "/api/report-analysis",
      {
        report: params.report,
        description: params.description,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
    };
    const status = err?.response?.status;
    const apiMessage =
      err?.response?.data?.message || err?.response?.data?.error;
    const message =
      apiMessage ||
      (status
        ? `Erro ao analisar relatório (HTTP ${status})`
        : "Erro ao analisar relatório");

    console.error("Report analysis failed:", error);
    throw new Error(message);
  }
}
