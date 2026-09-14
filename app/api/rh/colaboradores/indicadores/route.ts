import { api } from "@/lib/axios";
import { assertIndicadoresSuporteScope } from "@/lib/rh/assert-indicadores-scope";

const REQUIRED_QUERY_PARAMS = [
  "suporte_id",
  "data_inicial",
  "data_final",
] as const;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(
      REQUIRED_QUERY_PARAMS.map((key) => [
        key,
        url.searchParams.get(key)?.trim() ?? "",
      ]),
    ) as Record<(typeof REQUIRED_QUERY_PARAMS)[number], string>;

    const missingParam = REQUIRED_QUERY_PARAMS.find((key) => !params[key]);
    if (missingParam) {
      return Response.json(
        { error: `Parâmetro ${missingParam} é obrigatório` },
        { status: 400 },
      );
    }

    const scope = await assertIndicadoresSuporteScope(params.suporte_id);
    if (!scope.ok) return scope.response;

    const response = await api.get("/rh/colaboradores/indicadores", {
      params,
      headers: scope.authorizationHeader,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route de indicadores de colaboradores:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ??
      data?.error ??
      err?.message ??
      "Erro ao buscar indicadores de colaboradores";

    return Response.json({ error: errorMessage }, { status });
  }
}
