import type { AuxiliarUsuarioDiscord } from "@/lib/discord/types";

const TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  data: AuxiliarUsuarioDiscord[];
  expiresAt: number;
};

const usuariosCache = new Map<string, CacheEntry>();

export async function getCachedUsuarios(
  cacheKey: string,
  fetcher: () => Promise<AuxiliarUsuarioDiscord[]>,
): Promise<AuxiliarUsuarioDiscord[]> {
  const now = Date.now();
  const cached = usuariosCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const data = await fetcher();
  usuariosCache.set(cacheKey, { data, expiresAt: now + TTL_MS });
  return data;
}
