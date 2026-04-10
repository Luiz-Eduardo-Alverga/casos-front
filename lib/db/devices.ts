import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { devices } from "@/db/schema";
import { ilikeContains } from "@/lib/db/search-ilike";

export type DeviceRow = typeof devices.$inferSelect;
export type DeviceInsert = typeof devices.$inferInsert;

export async function listDevices(search?: string): Promise<DeviceRow[]> {
  const term = search?.trim();
  const q = db.select().from(devices);
  if (term) {
    return q.where(ilikeContains(devices.name, term)).orderBy(asc(devices.name));
  }
  return q.orderBy(asc(devices.name));
}

export async function getDeviceById(id: string): Promise<DeviceRow | undefined> {
  const rows = await db
    .select()
    .from(devices)
    .where(eq(devices.id, id))
    .limit(1);
  return rows[0];
}

export async function insertDevice(values: DeviceInsert): Promise<DeviceRow> {
  const rows = await db.insert(devices).values(values).returning();
  return rows[0];
}

export async function updateDevice(
  id: string,
  values: Partial<Omit<DeviceInsert, "id">>,
): Promise<DeviceRow | undefined> {
  const rows = await db
    .update(devices)
    .set(values)
    .where(eq(devices.id, id))
    .returning();
  return rows[0];
}

export async function deleteDevice(id: string): Promise<boolean> {
  const rows = await db
    .delete(devices)
    .where(eq(devices.id, id))
    .returning({ id: devices.id });
  return rows.length > 0;
}
