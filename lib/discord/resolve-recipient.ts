import type { User } from "discord.js";
import { getDiscordClient } from "@/lib/discord/client";

const DISCORD_SNOWFLAKE_RE = /^\d{17,20}$/;
const RECIPIENT_CACHE_TTL_MS = 10 * 60 * 1000;

const recipientIdCache = new Map<string, { userId: string; expiresAt: number }>();

function normalizeDiscordUsername(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

function recipientCacheKey(guildId: string, normalized: string): string {
  return `${guildId}:${normalized}`;
}

function getCachedRecipientId(guildId: string, normalized: string): string | null {
  const key = recipientCacheKey(guildId, normalized);
  const entry = recipientIdCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    recipientIdCache.delete(key);
    return null;
  }
  return entry.userId;
}

function setCachedRecipientId(
  guildId: string,
  normalized: string,
  userId: string,
): void {
  recipientIdCache.set(recipientCacheKey(guildId, normalized), {
    userId,
    expiresAt: Date.now() + RECIPIENT_CACHE_TTL_MS,
  });
}

function matchesDiscordUsername(user: User, normalized: string): boolean {
  const username = user.username.toLowerCase();
  const globalName = user.globalName?.toLowerCase();
  return username === normalized || globalName === normalized;
}

async function resolveByGuildSearch(
  guildId: string,
  normalized: string,
): Promise<User | null> {
  const client = await getDiscordClient();
  const guild = await client.guilds.fetch(guildId);
  const members = await guild.members.search({
    query: normalized,
    limit: 10,
  });

  for (const [, member] of members) {
    if (matchesDiscordUsername(member.user, normalized)) {
      setCachedRecipientId(guildId, normalized, member.user.id);
      return member.user;
    }
  }

  const first = members.first();
  if (first && matchesDiscordUsername(first.user, normalized)) {
    setCachedRecipientId(guildId, normalized, first.user.id);
    return first.user;
  }

  return null;
}

/**
 * Resolve `usuario_discord` (username, ex.: luizeduardo9844) ou ID numérico para User do Discord.
 */
export async function resolveDiscordRecipient(
  usuarioDiscord: string,
): Promise<User | null> {
  const raw = usuarioDiscord.trim();
  if (!raw) return null;

  const client = await getDiscordClient();

  if (DISCORD_SNOWFLAKE_RE.test(raw)) {
    try {
      return await client.users.fetch(raw);
    } catch {
      return null;
    }
  }

  const normalized = normalizeDiscordUsername(raw);
  const guildId = process.env.DISCORD_GUILD_ID?.trim();

  if (!guildId) {
    console.warn(
      "[discord] DISCORD_GUILD_ID ausente; não é possível resolver username:",
      normalized,
    );
    return null;
  }

  const cachedId = getCachedRecipientId(guildId, normalized);
  if (cachedId) {
    try {
      return await client.users.fetch(cachedId);
    } catch {
      recipientIdCache.delete(recipientCacheKey(guildId, normalized));
    }
  }

  try {
    return await resolveByGuildSearch(guildId, normalized);
  } catch (error) {
    console.error("[discord] Falha ao buscar membro por username:", error);
    return null;
  }
}
