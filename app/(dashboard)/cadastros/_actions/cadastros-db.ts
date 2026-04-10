"use server";

import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { DB_CACHE_TAG } from "@/lib/server/fetch-api-db";

async function serverOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

type ActionFail = { ok: false; message: string };
type ActionOk<T> = { ok: true; data: T };
type ActionResult<T> = ActionOk<T> | ActionFail;

async function postApiDb<T>(
  path: string,
  body: unknown,
  tag: string,
): Promise<ActionResult<T>> {
  const origin = await serverOrigin();
  const store = await cookies();
  const cookie = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });

  let json: { data?: T; error?: { message?: string } } = {};
  try {
    json = (await res.json()) as typeof json;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    return {
      ok: false,
      message: json?.error?.message ?? `Erro ${res.status}`,
    };
  }
  if (json?.error?.message) {
    return { ok: false, message: json.error.message };
  }

  revalidateTag(tag, "max");
  return { ok: true, data: json.data as T };
}

export async function createAcquirerAction(input: {
  name: string;
  logoUrl?: string | null;
  has4g?: boolean;
}): Promise<ActionResult<unknown>> {
  return postApiDb("/api/db/acquirers", input, DB_CACHE_TAG.acquirers);
}

export async function createDeviceAction(input: {
  name: string;
}): Promise<ActionResult<unknown>> {
  return postApiDb("/api/db/devices", input, DB_CACHE_TAG.devices);
}

export async function createVersionAction(input: {
  name?: string | null;
}): Promise<ActionResult<unknown>> {
  return postApiDb("/api/db/versions", input, DB_CACHE_TAG.versions);
}
