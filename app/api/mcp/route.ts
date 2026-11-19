import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { withConectorPermission } from "@/lib/api-db/with-conector-permission";
import { criarServidorMcp } from "@/lib/conector-claude/mcp/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Servidor MCP do conector do Claude (Streamable HTTP, sem estado e com resposta JSON, sem SSE).
 * Cada requisição valida o Bearer do Claude e monta um servidor com as ferramentas da pessoa.
 */
export async function POST(request: Request) {
  return withConectorPermission(request, null, async (session) => {
    const server = criarServidorMcp(session);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    try {
      return await transport.handleRequest(request);
    } finally {
      await transport.close().catch(() => {});
      await server.close().catch(() => {});
    }
  });
}

/** Sem SSE: GET e DELETE não se aplicam a um servidor sem estado. */
async function metodoNaoSuportado(request: Request) {
  return withConectorPermission(request, null, async () =>
    Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Método não suportado" },
        id: null,
      },
      { status: 405, headers: { Allow: "POST" } },
    ),
  );
}

export const GET = metodoNaoSuportado;
export const DELETE = metodoNaoSuportado;
