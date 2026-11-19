import { api } from "@/lib/axios";
import { scheduleDiscordCasoNotify } from "@/lib/discord/schedule-notify";
import {
  buildNotifyInputFromCreate,
  parseCreateResponseRegistro,
  type ProjetoCasoCreateBody,
} from "@/lib/discord/parse-create-payload";

export interface CriarCasoResult {
  /** Status HTTP devolvido pela API Soft Flow. */
  status: number;
  /** Corpo devolvido pela API Soft Flow, sem alteração. */
  data: unknown;
  /** Número do caso criado, quando a resposta permite extrair. */
  registro: number | null;
}

/**
 * Cria caso/report na API Soft Flow (`POST /projeto-casos`) e agenda a DM no Discord
 * para o dev atribuído. Usado pela rota `POST /api/projeto-casos` e pelo conector do Claude.
 *
 * Erros da API (axios) são propagados para quem chamou tratar.
 */
export async function criarCaso(
  authorizationHeader: { Authorization: string },
  body: ProjetoCasoCreateBody,
): Promise<CriarCasoResult> {
  const response = await api.post("/projeto-casos", body, {
    headers: authorizationHeader,
  });

  const registro = parseCreateResponseRegistro(response.data);
  const notifyInput =
    registro != null ? buildNotifyInputFromCreate(body, registro) : null;
  if (notifyInput) {
    scheduleDiscordCasoNotify(authorizationHeader, notifyInput);
  }

  return { status: response.status, data: response.data, registro };
}
