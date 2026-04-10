import type { ZodError } from "zod";
import { jsonError } from "./responses";

export function badRequestFromZod(error: ZodError): Response {
  const first = error.issues[0];
  const message = first
    ? `${first.path.length ? `${first.path.join(".")}: ` : ""}${first.message}`
    : "Dados inválidos";
  return jsonError(message, 400);
}
