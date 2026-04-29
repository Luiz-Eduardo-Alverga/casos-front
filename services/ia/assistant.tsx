import { apiAssistant } from "@/lib/axios";

interface AssistantParams {
  description?: string;
  audio?: Blob;
}

interface AssistantResponse {
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

export async function assistant({ description, audio }: AssistantParams) {
  // Se houver áudio, enviar como FormData
  if (audio) {
    const formData = new FormData();

    // Adicionar description se existir
    if (description) {
      formData.append("description", description);
    }

    // Adicionar áudio
    // Determinar extensão baseada no tipo MIME
    const extension = audio.type.includes("webm")
      ? "webm"
      : audio.type.includes("mp3")
        ? "mp3"
        : audio.type.includes("wav")
          ? "wav"
          : "mp3";
    formData.append("audio", audio, `audio.${extension}`);

    const response = await apiAssistant.post<AssistantResponse>(
      "/api/assistant",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  }

  // Se não houver áudio, enviar como JSON
  const response = await apiAssistant.post<AssistantResponse>(
    "/api/assistant",
    {
      description: description || "",
    },
  );

  return response.data;
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
  } catch (error: any) {
    const status = error?.response?.status;
    const apiMessage =
      error?.response?.data?.message || error?.response?.data?.error;
    const message =
      apiMessage ||
      (status
        ? `Erro ao analisar relatório (HTTP ${status})`
        : "Erro ao analisar relatório");

    console.error("Report analysis failed:", error);
    throw new Error(message);
  }
}
