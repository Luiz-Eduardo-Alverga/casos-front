/**
 * Erro de requisição HTTP com status preservado (ex.: 404 para React Query).
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
