import { HttpError } from "@/lib/http-error";

/**
 * Erro HTTP da fachada de produtos (status preservado para a UI tratar 409/404).
 */
export class ApiError extends HttpError {
  constructor(status: number, message: string) {
    super(status, message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function errorMessageFromBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const payload = body as { message?: unknown; error?: unknown };
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  if (payload.error && typeof payload.error === "object") {
    const nested = (payload.error as { message?: unknown }).message;
    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }
  }
  return fallback;
}
