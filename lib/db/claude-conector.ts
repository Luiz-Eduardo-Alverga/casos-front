import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  appUsers,
  claudeConexoes,
  oauthClientes,
  oauthCodigos,
} from "@/db/schema";

export type OauthClienteRow = typeof oauthClientes.$inferSelect;
export type ClaudeConexaoRow = typeof claudeConexoes.$inferSelect;
export type OauthCodigoRow = typeof oauthCodigos.$inferSelect;
export type AppUserRowConector = typeof appUsers.$inferSelect;

export type MotivoRevogacao = "usuario" | "expirado" | "reconectou";

/* ─── Clientes (DCR) ─────────────────────────────────────────────────────── */

export async function insertOauthCliente(input: {
  id: string;
  nome: string;
  redirectUris: string[];
}): Promise<OauthClienteRow> {
  const [row] = await db.insert(oauthClientes).values(input).returning();
  return row;
}

export async function getOauthClienteById(
  id: string,
): Promise<OauthClienteRow | null> {
  const [row] = await db
    .select()
    .from(oauthClientes)
    .where(eq(oauthClientes.id, id))
    .limit(1);
  return row ?? null;
}

/* ─── Conexões ───────────────────────────────────────────────────────────── */

/**
 * Cria a conexão da pessoa e revoga a anterior (uma conexão ativa por pessoa, decisão #11).
 */
export async function insertConexaoRevogandoAnteriores(input: {
  appUserId: string;
  clienteId: string;
  legacyTokenCifrado: string;
}): Promise<ClaudeConexaoRow> {
  return db.transaction(async (tx) => {
    await tx
      .update(claudeConexoes)
      .set({ revogadoEm: new Date(), motivoRevogacao: "reconectou" })
      .where(
        and(
          eq(claudeConexoes.appUserId, input.appUserId),
          isNull(claudeConexoes.revogadoEm),
        ),
      );
    const [row] = await tx.insert(claudeConexoes).values(input).returning();
    return row;
  });
}

export async function setConexaoTokens(
  conexaoId: string,
  tokens: {
    accessTokenHash: string;
    accessExpiraEm: Date;
    refreshTokenHash: string;
    refreshExpiraEm: Date;
  },
): Promise<void> {
  await db
    .update(claudeConexoes)
    .set(tokens)
    .where(
      and(eq(claudeConexoes.id, conexaoId), isNull(claudeConexoes.revogadoEm)),
    );
}

/**
 * Rotação do refresh token: troca os hashes só se o refresh atual bater, a conexão estiver
 * ativa e o refresh não tiver vencido. Atômico; devolve null se não trocou.
 */
export async function rotateConexaoTokensByRefreshHash(
  refreshTokenHashAtual: string,
  tokens: {
    accessTokenHash: string;
    accessExpiraEm: Date;
    refreshTokenHash: string;
    refreshExpiraEm: Date;
  },
): Promise<ClaudeConexaoRow | null> {
  const [row] = await db
    .update(claudeConexoes)
    .set(tokens)
    .where(
      and(
        eq(claudeConexoes.refreshTokenHash, refreshTokenHashAtual),
        isNull(claudeConexoes.revogadoEm),
        gt(claudeConexoes.refreshExpiraEm, new Date()),
      ),
    )
    .returning();
  return row ?? null;
}

/** Conexão ativa dona do access token (não vencido), com o usuário local. */
export async function getConexaoAtivaByAccessHash(
  accessTokenHash: string,
): Promise<{ conexao: ClaudeConexaoRow; appUser: AppUserRowConector } | null> {
  const [row] = await db
    .select({ conexao: claudeConexoes, appUser: appUsers })
    .from(claudeConexoes)
    .innerJoin(appUsers, eq(appUsers.id, claudeConexoes.appUserId))
    .where(
      and(
        eq(claudeConexoes.accessTokenHash, accessTokenHash),
        isNull(claudeConexoes.revogadoEm),
        gt(claudeConexoes.accessExpiraEm, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getConexaoAtivaByAppUserId(
  appUserId: string,
): Promise<ClaudeConexaoRow | null> {
  const [row] = await db
    .select()
    .from(claudeConexoes)
    .where(
      and(
        eq(claudeConexoes.appUserId, appUserId),
        isNull(claudeConexoes.revogadoEm),
      ),
    )
    .orderBy(desc(claudeConexoes.criadoEm))
    .limit(1);
  return row ?? null;
}

export async function updateConexaoLegacyToken(
  conexaoId: string,
  legacyTokenCifrado: string,
): Promise<void> {
  await db
    .update(claudeConexoes)
    .set({ legacyTokenCifrado, legacyTokenAtualizadoEm: new Date() })
    .where(eq(claudeConexoes.id, conexaoId));
}

export async function touchConexaoUltimoUso(conexaoId: string): Promise<void> {
  await db
    .update(claudeConexoes)
    .set({ ultimoUsoEm: new Date() })
    .where(eq(claudeConexoes.id, conexaoId));
}

export async function revogarConexao(
  conexaoId: string,
  motivo: MotivoRevogacao,
): Promise<void> {
  await db
    .update(claudeConexoes)
    .set({ revogadoEm: new Date(), motivoRevogacao: motivo })
    .where(
      and(eq(claudeConexoes.id, conexaoId), isNull(claudeConexoes.revogadoEm)),
    );
}

/** Revoga todas as conexões ativas da pessoa; devolve quantas foram revogadas. */
export async function revogarConexoesDoUsuario(
  appUserId: string,
  motivo: MotivoRevogacao,
): Promise<number> {
  const rows = await db
    .update(claudeConexoes)
    .set({ revogadoEm: new Date(), motivoRevogacao: motivo })
    .where(
      and(
        eq(claudeConexoes.appUserId, appUserId),
        isNull(claudeConexoes.revogadoEm),
      ),
    )
    .returning({ id: claudeConexoes.id });
  return rows.length;
}

/* ─── Códigos de autorização ─────────────────────────────────────────────── */

export async function insertOauthCodigo(input: {
  codigoHash: string;
  clienteId: string;
  conexaoId: string;
  redirectUri: string;
  codeChallenge: string;
  expiraEm: Date;
}): Promise<void> {
  await db.insert(oauthCodigos).values(input);
}

/**
 * Marca o código como usado (uso único, atômico). Devolve null se não existe, já foi usado
 * ou venceu.
 */
export async function consumeOauthCodigo(
  codigoHash: string,
): Promise<OauthCodigoRow | null> {
  const [row] = await db
    .update(oauthCodigos)
    .set({ usadoEm: new Date() })
    .where(
      and(
        eq(oauthCodigos.codigoHash, codigoHash),
        isNull(oauthCodigos.usadoEm),
        gt(oauthCodigos.expiraEm, new Date()),
      ),
    )
    .returning();
  return row ?? null;
}

/** Código que já tinha sido usado (reuso indica vazamento: a conexão é revogada). */
export async function getOauthCodigoByHash(
  codigoHash: string,
): Promise<OauthCodigoRow | null> {
  const [row] = await db
    .select()
    .from(oauthCodigos)
    .where(eq(oauthCodigos.codigoHash, codigoHash))
    .limit(1);
  return row ?? null;
}
