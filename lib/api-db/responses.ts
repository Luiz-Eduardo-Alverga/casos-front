/**
 * Respostas JSON padronizadas para rotas `/api/db`.
 * Formato envelopado: sucesso `{ data: T }`, erro `{ error: { message: string } }`.
 */

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: { message } }, { status });
}

export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

function postgresCodeFromUnknown(err: unknown): string | undefined {
  let current: unknown = err;
  const seen = new Set<unknown>();
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const o = current as { code?: unknown; cause?: unknown };
    if (typeof o.code === "string" && o.code.length > 0) {
      return o.code;
    }
    current = o.cause;
  }
  return undefined;
}

/**
 * Mapeia erros do Postgres (via Drizzle/postgres.js) para HTTP.
 * Retorna `null` se não for um caso conhecido (tratar como 500).
 */
export function conflictOrNull(err: unknown): Response | null {
  const code = postgresCodeFromUnknown(err);
  if (code === "23503") {
    return jsonError(
      "Operação inválida: registro referenciado não existe ou está em uso.",
      409,
    );
  }
  if (code === "23505") {
    return jsonError("Conflito: valor duplicado.", 409);
  }
  return null;
}

export function handleDbRouteError(e: unknown, logContext: string): Response {
  console.error(logContext, e);
  const conflict = conflictOrNull(e);
  if (conflict) return conflict;
  return jsonError("Erro interno do servidor", 500);
}
