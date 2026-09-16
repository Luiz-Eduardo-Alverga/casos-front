import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { appUsers, docs } from "./schema";

/** Metadados de anexos de documentação (mesmo bucket `casos-anexos`; path `docs/{docId}/…`). */
export const docAttachments = pgTable(
  "doc_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    docId: uuid("doc_id")
      .notNull()
      .references(() => docs.id, { onDelete: "cascade" }),
    bucket: text("bucket").notNull().default("casos-anexos"),
    path: text("path").notNull().unique(),
    filenameOriginal: text("filename_original").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    kind: text("kind").notNull(),
    createdBy: uuid("created_by").references(() => appUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("doc_attachments_doc_id_idx").on(t.docId)],
);
