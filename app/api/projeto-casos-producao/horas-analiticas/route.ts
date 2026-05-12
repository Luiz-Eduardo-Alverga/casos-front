import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

const REQUIRED_QUERY_PARAMS = ["data_producao_inicio", "data_producao_fim"] as const;
const FILTER_QUERY_PARAMS = ["produto_id", "projeto_id", "usuario"] as const;

type ProducaoHorasAnaliticasQueryParam =
  | (typeof REQUIRED_QUERY_PARAMS)[number]
  | (typeof FILTER_QUERY_PARAMS)[number];

function getQueryParams(url: URL) {
  const requiredParams = REQUIRED_QUERY_PARAMS.reduce(
    (params, key) => {
      params[key] = url.searchParams.get(key)?.trim() ?? "";
      return params;
    },
    {} as Record<(typeof REQUIRED_QUERY_PARAMS)[number], string>,
  );

  const filterParams = FILTER_QUERY_PARAMS.reduce(
    (params, key) => {
      const value = url.searchParams.get(key)?.trim();
      if (value) {
        params[key] = value;
      }
      return params;
    },
    {} as Partial<Record<(typeof FILTER_QUERY_PARAMS)[number], string>>,
  );

  return {
    ...requiredParams,
    ...filterParams,
  } as Partial<Record<ProducaoHorasAnaliticasQueryParam, string>>;
}

export async function GET(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const queryParams = getQueryParams(url);
    const missingParam = REQUIRED_QUERY_PARAMS.find(
      (key) => !queryParams[key],
    );

    if (missingParam) {
      return Response.json(
        { error: `Parâmetro ${missingParam} é obrigatório` },
        { status: 400 },
      );
    }

    const hasAtLeastOneFilter = FILTER_QUERY_PARAMS.some(
      (key) => Boolean(queryParams[key]),
    );

    if (!hasAtLeastOneFilter) {
      return Response.json(
        {
          error:
            "Informe ao menos um filtro: produto_id, projeto_id ou usuario",
        },
        { status: 400 },
      );
    }

    const response = await api.get("/producao-horas-analiticas", {
      params: queryParams,
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route de produção horas analíticas:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ??
      data?.error ??
      err?.message ??
      "Erro ao buscar produção de horas analíticas";

    return Response.json({ error: errorMessage }, { status });
  }
}
