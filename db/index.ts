import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

// Pooler de transação do Supabase (porta 6543) não suporta prepared statements.
// Sem `prepare: false` as queries penduram e o Cloudflare devolve 524.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
