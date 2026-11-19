import {
  ESCOPO_CONECTOR,
  getMcpResourceUrl,
  getPublicOrigin,
} from "@/lib/conector-claude/config";

/**
 * Metadados do recurso protegido (RFC 9728) do conector do Claude.
 * Responde em `/.well-known/oauth-protected-resource` e no caminho com sufixo
 * (`/.well-known/oauth-protected-resource/api/mcp`), que é o anunciado no `WWW-Authenticate`.
 */
export function GET() {
  return Response.json(
    {
      resource: getMcpResourceUrl(),
      authorization_servers: [getPublicOrigin()],
      bearer_methods_supported: ["header"],
      scopes_supported: [ESCOPO_CONECTOR],
      resource_name: "Softflow",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
