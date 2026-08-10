import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ liberacaoId: string }> },
) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { liberacaoId } = await params;

    if (!liberacaoId?.trim()) {
      return Response.json(
        { success: false, error: "Parâmetro liberacaoId é obrigatório" },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_ASSISTANT_API_URL;
    if (!baseUrl) {
      return Response.json(
        { success: false, error: "ASSISTANT_API_URL não configurada" },
        { status: 500 },
      );
    }

    const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/api/release-notes/${encodeURIComponent(liberacaoId)}/stream`;

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
      signal: request.signal,
    });

    if (!upstream.ok) {
      const errorBody = (await upstream.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      const message =
        errorBody.error ||
        errorBody.message ||
        "Erro ao gerar registro de liberação com IA";
      return Response.json(
        { success: false, error: message },
        { status: upstream.status },
      );
    }

    if (!upstream.body) {
      return Response.json(
        { success: false, error: "Stream de progresso indisponível" },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    return assistantProxyErrorResponse(
      error,
      "Erro ao gerar registro de liberação com IA",
    );
  }
}
