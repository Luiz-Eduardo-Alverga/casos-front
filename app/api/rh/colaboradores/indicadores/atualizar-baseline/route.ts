import { api } from "@/lib/axios";
import { assertIndicadoresSuporteScope } from "@/lib/rh/assert-indicadores-scope";

const REQUIRED_NUMBER_FIELDS = ["id", "indicador_id", "suporte_id"] as const;
const REQUIRED_STRING_FIELDS = [
  "data_inicial",
  "data_final",
  "pdv",
  "setor",
] as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Corpo da requisição é obrigatório" },
        { status: 400 },
      );
    }

    const missingNumber = REQUIRED_NUMBER_FIELDS.find(
      (key) => !isFiniteNumber(body[key]),
    );
    if (missingNumber) {
      return Response.json(
        { error: `Parâmetro ${missingNumber} é obrigatório` },
        { status: 400 },
      );
    }

    if (typeof body.pilha !== "boolean") {
      return Response.json(
        { error: "Parâmetro pilha é obrigatório" },
        { status: 400 },
      );
    }

    const missingString = REQUIRED_STRING_FIELDS.find((key) => {
      const value = body[key];
      return typeof value !== "string" || !value.trim();
    });
    if (missingString) {
      return Response.json(
        { error: `Parâmetro ${missingString} é obrigatório` },
        { status: 400 },
      );
    }

    const payload = {
      id: body.id,
      indicador_id: body.indicador_id,
      pilha: body.pilha,
      suporte_id: body.suporte_id,
      data_inicial: body.data_inicial.trim(),
      data_final: body.data_final.trim(),
      pdv: body.pdv.trim(),
      setor: body.setor.trim(),
    };

    const scope = await assertIndicadoresSuporteScope(payload.suporte_id);
    if (!scope.ok) return scope.response;

    const response = await api.post(
      "/rh/colaboradores/indicadores/atualizar-baseline",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...scope.authorizationHeader,
        },
      },
    );

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

    console.error("Erro na API Route ao recalcular indicador:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ??
      data?.error ??
      err?.message ??
      "Erro ao recalcular indicador";

    return Response.json({ error: errorMessage }, { status });
  }
}
