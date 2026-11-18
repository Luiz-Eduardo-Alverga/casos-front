import {
  api,
  authConfig,
  isErrorResponse,
  proxyLegacy,
  readJsonBody,
  withPermission,
} from "@/app/api/produtos/_lib/proxy";
import type { CriarComunicadoPayload } from "@/services/comunicados/types";

export async function POST(request: Request) {
  return withPermission("create-aviso", async (session) => {
    const body = await readJsonBody<CriarComunicadoPayload>(request);
    if (isErrorResponse(body)) return body;

    return proxyLegacy("Erro ao criar comunicado", () =>
      api.post("/comunicados", body, authConfig(session)),
    );
  });
}
