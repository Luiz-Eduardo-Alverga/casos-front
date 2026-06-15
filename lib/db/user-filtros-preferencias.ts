import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userCasesFiltersPreferences } from "@/db/schema";
import { DEFAULT_FILTROS_RESUMO, type FiltroResumoItem } from "@/lib/types/filtros-resumo";

export async function getUserFiltrosPreferencias(
  userId: string,
): Promise<FiltroResumoItem[]> {
  const rows = await db
    .select({ filtrosResumo: userCasesFiltersPreferences.filtrosResumo })
    .from(userCasesFiltersPreferences)
    .where(eq(userCasesFiltersPreferences.userId, userId))
    .limit(1);

  return rows[0]?.filtrosResumo ?? DEFAULT_FILTROS_RESUMO;
}

export async function upsertUserFiltrosPreferencias(
  userId: string,
  filtros: FiltroResumoItem[],
): Promise<void> {
  await db
    .insert(userCasesFiltersPreferences)
    .values({ userId, filtrosResumo: filtros, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userCasesFiltersPreferences.userId,
      set: { filtrosResumo: filtros, updatedAt: new Date() },
    });
}
