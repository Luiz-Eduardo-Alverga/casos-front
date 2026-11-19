import { api } from "@/lib/axios";
import { cifrar, decifrar } from "@/lib/conector-claude/crypto";
import {
  revogarConexao,
  updateConexaoLegacyToken,
  type ClaudeConexaoRow,
} from "@/lib/db/claude-conector";

export type AuthorizationHeader = { Authorization: string };

/** A conexão perdeu o token Soft Flow (refresh recusado): a pessoa precisa reconectar. */
export class ConexaoExpiradaError extends Error {
  constructor() {
    super("Conexão com o Softflow expirada; reconecte o Claude");
    this.name = "ConexaoExpiradaError";
  }
}

/** Senha ou usuário recusados pelo legado no login da tela de autorização. */
export class LoginRecusadoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginRecusadoError";
  }
}

function isUnauthorized(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 401;
}

/**
 * Emite um token Soft Flow próprio da conexão por `POST /auth/login` (decisão #14).
 * A senha só passa por aqui; nunca é gravada nem logada.
 */
export async function emitirTokenPorLogin(
  usuario: string,
  senha: string,
): Promise<{ token: string; user: unknown }> {
  try {
    const response = await api.post("/auth/login", { usuario, senha });
    const token = response.data?.authorization?.token;
    const user = response.data?.user;
    if (typeof token !== "string" || !token || !user) {
      throw new Error("Resposta de login inválida");
    }
    return { token, user };
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401 || status === 422 || status === 400) {
      throw new LoginRecusadoError("Senha incorreta");
    }
    throw error;
  }
}

/** Troca o token da conexão por um novo (`POST /auth/refresh`); o anterior deixa de valer. */
async function renovarTokenLegacy(token: string): Promise<string | null> {
  try {
    const response = await api.post(
      "/auth/refresh",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const novo = response.data?.authorization?.token;
    return typeof novo === "string" && novo ? novo : null;
  } catch {
    return null;
  }
}

export function cifrarTokenLegacy(token: string): string {
  return cifrar(token);
}

export function authHeaderDaConexao(
  conexao: Pick<ClaudeConexaoRow, "legacyTokenCifrado">,
): AuthorizationHeader {
  return { Authorization: `Bearer ${decifrar(conexao.legacyTokenCifrado)}` };
}

/**
 * Renova o token Soft Flow da conexão e grava o novo. Se o legado recusar, marca a conexão
 * como expirada e lança {@link ConexaoExpiradaError}.
 */
export async function renovarTokenDaConexao(
  conexao: Pick<ClaudeConexaoRow, "id" | "legacyTokenCifrado">,
): Promise<AuthorizationHeader> {
  const atual = decifrar(conexao.legacyTokenCifrado);
  const novo = await renovarTokenLegacy(atual);
  if (!novo) {
    await revogarConexao(conexao.id, "expirado");
    throw new ConexaoExpiradaError();
  }
  const cifrado = cifrar(novo);
  await updateConexaoLegacyToken(conexao.id, cifrado);
  conexao.legacyTokenCifrado = cifrado;
  return { Authorization: `Bearer ${novo}` };
}

/**
 * Executa uma chamada à API Soft Flow com o token da conexão. Em 401, renova o token uma vez
 * e repete; se a renovação falhar, lança {@link ConexaoExpiradaError}.
 */
export async function comTokenDaConexao<T>(
  conexao: Pick<ClaudeConexaoRow, "id" | "legacyTokenCifrado">,
  fn: (auth: AuthorizationHeader) => Promise<T>,
): Promise<T> {
  try {
    return await fn(authHeaderDaConexao(conexao));
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
    const auth = await renovarTokenDaConexao(conexao);
    return fn(auth);
  }
}
