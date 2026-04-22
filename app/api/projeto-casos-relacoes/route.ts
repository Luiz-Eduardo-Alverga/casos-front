import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

function isValidTipoRelacao(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const registroParam = url.searchParams.get("registro");

    if (!registroParam) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 }
      );
    }

    const registro = Number(registroParam);
    if (!Number.isFinite(registro)) {
      return Response.json(
        { error: "Parametro registro inválido" },
        { status: 400 }
      );
    }

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/projeto-casos-relacoes", {
      params: { registro },
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
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao buscar relações do caso:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao buscar relações do caso";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const registro = body?.registro;
    const tipo_relacao = body?.tipo_relacao;
    const caso_relacionado = body?.caso_relacionado;
    const descricao_resumo = body?.descricao_resumo;

    if (!Number.isFinite(registro)) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 }
      );
    }
    if (!isValidTipoRelacao(tipo_relacao)) {
      return Response.json(
        { error: "Parametro tipo_relacao é obrigatório" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(caso_relacionado)) {
      return Response.json(
        { error: "Parametro caso_relacionado é obrigatório" },
        { status: 400 }
      );
    }
    if (typeof descricao_resumo !== "string" || !descricao_resumo.trim()) {
      return Response.json(
        { error: "Parametro descricao_resumo é obrigatório" },
        { status: 400 }
      );
    }

    const response = await api.post("/projeto-casos-relacoes", body, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao criar relação do caso:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao criar relação do caso";
    return Response.json({ error: errorMessage }, { status });
  }
}

