import { fetchWithAuth } from "@/lib/fetch";

export interface MensagemDatas {
  msg: string | null;
  hora: string | null;
  enviado: string | null;
  inicio: string | null;
  prazo_limite: string | null;
  endo_inicial: string | null;
  endo_final: string | null;
}

export interface MensagemStatusLeitura {
  lido: boolean;
  auto: boolean;
  data_lido: string | null;
}

export interface Mensagem {
  id: number;
  datas: MensagemDatas;
  enviado_por: string;
  titulo: string;
  link: string | null;
  msg_texto: string;
  id_tipo: number;
  endo_imagem: string | null;
  status_leitura: MensagemStatusLeitura;
}

export interface MensagensResponse {
  success: boolean;
  data: Mensagem[];
  total: number;
}

export interface GetMensagensParams {
  id?: number | string;
  lido?: boolean;
  data_msg_inicio?: string;
  data_msg_fim?: string;
}

export async function getMensagens(
  params?: GetMensagensParams
): Promise<MensagensResponse> {
  const url = new URL("/api/mensagens", window.location.origin);
  if (params) {
    if (params.id != null) url.searchParams.set("id", String(params.id));
    if (params.lido != null) url.searchParams.set("lido", String(params.lido));
    if (params.data_msg_inicio)
      url.searchParams.set("data_msg_inicio", params.data_msg_inicio);
    if (params.data_msg_fim)
      url.searchParams.set("data_msg_fim", params.data_msg_fim);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar mensagens"
    );
  }

  return await response.json();
}
