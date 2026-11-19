import { ESCOPO_CONECTOR, getPublicOrigin } from "@/lib/conector-claude/config";

/**
 * Metadados do servidor de autorização (RFC 8414) do conector do Claude.
 * Só DCR: não anuncia `client_id_metadata_document_supported` (ver Fase 0 no README).
 */
export function GET() {
  const origin = getPublicOrigin();
  return Response.json(
    {
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/autorizar`,
      token_endpoint: `${origin}/api/oauth/token`,
      registration_endpoint: `${origin}/api/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      scopes_supported: [ESCOPO_CONECTOR],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
