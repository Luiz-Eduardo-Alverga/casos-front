import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Valores além de `not_started` devem espelhar o `CREATE TYPE ... AS ENUM` do banco. */
export const statusTypeEnum = pgEnum("status_type", ["not_started"]);

const auth = pgSchema("auth");

/** Referência mínima a `auth.users` (Supabase) para a FK de `profiles`. */
export const authUsers = auth.table("users", {
  id: uuid("id").primaryKey(),
});

export const acquirers = pgTable("acquirers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  has4g: boolean("has_4g").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const versions = pgTable("versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name"),
});

export const acquirerStatus = pgTable("acquirer_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  acquirerId: uuid("acquirer_id")
    .notNull()
    .defaultRandom()
    .references(() => acquirers.id),
  status: statusTypeEnum("status").notNull().default("not_started"),
  currentVersionId: uuid("current_version_id")
    .notNull()
    .references(() => versions.id),
  nextVersionId: uuid("next_version_id").references(() => versions.id),
  deliveryDate: date("delivery_date"),
  recommendedDeviceId: uuid("recommended_device_id").references(() => devices.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  sortOrder: integer("sort_order").default(999),
  isActive: boolean("is_active").notNull().default(true),
  obs: text("obs"),
});

export const acquirerCompatibleDevices = pgTable(
  "acquirer_compatible_devices",
  {
    statusId: uuid("status_id")
      .notNull()
      .defaultRandom()
      .references(() => acquirerStatus.id),
    deviceId: uuid("device_id")
      .notNull()
      .defaultRandom()
      .references(() => devices.id),
    androidVersion: text("android_version"),
  },
  (t) => [
    primaryKey({
      columns: [t.statusId, t.deviceId],
      name: "acquirer_compatible_devices_pkey",
    }),
  ],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id),
    fullName: text("full_name"),
    email: text("email"),
    role: text("role").default("admin"),
    avatarUrl: text("avatar_url"),
  },
  (t) => ({
    roleCheck: check(
      "profiles_role_check",
      sql`${t.role} = ANY (ARRAY['admin'::text, 'editor'::text])`,
    ),
  }),
);
