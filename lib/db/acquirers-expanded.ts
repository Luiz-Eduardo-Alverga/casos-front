import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  acquirerCompatibleDevices,
  acquirers,
  acquirerStatus,
  devices,
  versions,
} from "@/db/schema";
import { ilikeContains } from "@/lib/db/search-ilike";
import type { AcquirerRow } from "@/lib/db/acquirers";

/** Item de listagem de adquirentes com status, versões e dispositivos compatíveis (API/UI). */
export type AcquirerListExpandedItem = {
  acquirer: AcquirerRow;
  acquirerStatusId: string | null;
  sortOrder: number | null;
  status: string | null;
  currentVersionId: string | null;
  nextVersionId: string | null;
  currentVersionName: string | null;
  nextVersionName: string | null;
  deliveryDate: string | null;
  recommendedDeviceId: string | null;
  /** `acquirer_status.is_active`; `null` se não houver linha de status. */
  isActive: boolean | null;
  compatibleDevices: {
    deviceId: string;
    deviceName: string;
    androidVersion: string | null;
    isPrimary: boolean;
  }[];
};

/**
 * Lista adquirentes com filtro opcional por nome e enriquecimento:
 * um registro `acquirer_status` por adquirente (menor `sort_order`, desempate `created_at`),
 * nomes das versões atual/próxima e dispositivos de `acquirer_compatible_devices`.
 */
export async function listAcquirersExpanded(
  search?: string,
  statusFilter?: string,
): Promise<AcquirerListExpandedItem[]> {
  const term = search?.trim();
  const base = db.select().from(acquirers);
  const acquirerRows = term
    ? await base
        .where(ilikeContains(acquirers.name, term))
        .orderBy(asc(acquirers.name))
    : await base.orderBy(asc(acquirers.name));

  if (acquirerRows.length === 0) return [];

  const statusRows = await db
    .select()
    .from(acquirerStatus)
    .orderBy(
      asc(acquirerStatus.acquirerId),
      asc(acquirerStatus.sortOrder),
      desc(acquirerStatus.createdAt),
    );

  const statusByAcquirer = new Map<string, (typeof statusRows)[number]>();
  for (const s of statusRows) {
    if (!statusByAcquirer.has(s.acquirerId)) {
      statusByAcquirer.set(s.acquirerId, s);
    }
  }

  const statusIds: string[] = [];
  const versionIds = new Set<string>();
  for (const a of acquirerRows) {
    const st = statusByAcquirer.get(a.id);
    if (st) {
      statusIds.push(st.id);
      versionIds.add(st.currentVersionId);
      if (st.nextVersionId) versionIds.add(st.nextVersionId);
    }
  }

  const versionRows =
    versionIds.size > 0
      ? await db
          .select()
          .from(versions)
          .where(inArray(versions.id, [...versionIds]))
      : [];

  const versionLabelById = new Map(
    versionRows.map((v) => [v.id, v.name?.trim() ? v.name : v.id.slice(0, 8)]),
  );

  const compatJoined =
    statusIds.length > 0
      ? await db
          .select({
            statusId: acquirerCompatibleDevices.statusId,
            deviceId: acquirerCompatibleDevices.deviceId,
            androidVersion: acquirerCompatibleDevices.androidVersion,
            deviceName: devices.name,
          })
          .from(acquirerCompatibleDevices)
          .innerJoin(
            devices,
            eq(acquirerCompatibleDevices.deviceId, devices.id),
          )
          .where(inArray(acquirerCompatibleDevices.statusId, statusIds))
      : [];

  const devicesByStatus = new Map<
    string,
    AcquirerListExpandedItem["compatibleDevices"]
  >();

  for (const row of compatJoined) {
    const list = devicesByStatus.get(row.statusId) ?? [];
    list.push({
      deviceId: row.deviceId,
      deviceName: row.deviceName,
      androidVersion: row.androidVersion,
      isPrimary: false,
    });
    devicesByStatus.set(row.statusId, list);
  }

  const items = acquirerRows.map((a) => {
    const st = statusByAcquirer.get(a.id) ?? null;
    let compatibleDevices: AcquirerListExpandedItem["compatibleDevices"] = [];

    if (st) {
      const raw = devicesByStatus.get(st.id) ?? [];
      compatibleDevices = raw.map((d) => ({
        ...d,
        isPrimary: st.recommendedDeviceId === d.deviceId,
      }));
      compatibleDevices.sort((x, y) => {
        if (x.isPrimary === y.isPrimary) return 0;
        return x.isPrimary ? -1 : 1;
      });
    }

    return {
      acquirer: a,
      acquirerStatusId: st?.id ?? null,
      sortOrder: st?.sortOrder ?? null,
      status: st?.status ?? null,
      currentVersionId: st?.currentVersionId ?? null,
      nextVersionId: st?.nextVersionId ?? null,
      currentVersionName: st
        ? versionLabelById.get(st.currentVersionId) ?? null
        : null,
      nextVersionName:
        st?.nextVersionId != null
          ? versionLabelById.get(st.nextVersionId) ?? null
          : null,
      deliveryDate: st?.deliveryDate ?? null,
      recommendedDeviceId: st?.recommendedDeviceId ?? null,
      isActive: st?.isActive ?? null,
      compatibleDevices,
    };
  });

  const f = statusFilter?.trim();
  if (!f) return items;
  return items.filter((item) => item.status === f);
}
