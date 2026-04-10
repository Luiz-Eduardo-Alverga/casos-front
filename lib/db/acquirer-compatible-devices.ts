import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { acquirerCompatibleDevices } from "@/db/schema";

export type AcquirerCompatibleDeviceRow =
  typeof acquirerCompatibleDevices.$inferSelect;
export type AcquirerCompatibleDeviceInsert =
  typeof acquirerCompatibleDevices.$inferInsert;

export async function listCompatibleDevicesByStatusId(
  statusId: string,
): Promise<AcquirerCompatibleDeviceRow[]> {
  return db
    .select()
    .from(acquirerCompatibleDevices)
    .where(eq(acquirerCompatibleDevices.statusId, statusId))
    .orderBy(asc(acquirerCompatibleDevices.deviceId));
}

export async function insertCompatibleDevice(
  values: AcquirerCompatibleDeviceInsert,
): Promise<AcquirerCompatibleDeviceRow> {
  const rows = await db
    .insert(acquirerCompatibleDevices)
    .values(values)
    .returning();
  return rows[0];
}

export async function deleteCompatibleDevicePair(
  statusId: string,
  deviceId: string,
): Promise<boolean> {
  const rows = await db
    .delete(acquirerCompatibleDevices)
    .where(
      and(
        eq(acquirerCompatibleDevices.statusId, statusId),
        eq(acquirerCompatibleDevices.deviceId, deviceId),
      ),
    )
    .returning({
      statusId: acquirerCompatibleDevices.statusId,
      deviceId: acquirerCompatibleDevices.deviceId,
    });
  return rows.length > 0;
}
