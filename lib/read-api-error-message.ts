/**
 * Lê a mensagem de erro de respostas `{ error: string }`, `{ message }`
 * ou `{ error: { message } }` (formato do `jsonError` / `withPermission`).
 */
export function readApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const body = payload as { message?: unknown; error?: unknown };

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }
  if (body.error && typeof body.error === "object") {
    const nested = (body.error as { message?: unknown }).message;
    if (typeof nested === "string" && nested.trim()) return nested;
  }

  return fallback;
}
