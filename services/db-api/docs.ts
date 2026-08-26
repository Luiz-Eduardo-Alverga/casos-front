import { fetchWithAuth } from "@/lib/fetch";
import { HttpError } from "@/lib/http-error";

export type DocStatus = "rascunho" | "publicado" | "desatualizado";
export type DocLinkType = "acquirer" | "product" | "client" | "case";

export interface DocCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string | null;
}

export interface DocLink {
  id?: string;
  docId?: string;
  entityType: DocLinkType;
  entityId: string;
  entityLabel: string;
  createdAt?: string | null;
}

export interface DocOwner {
  id: string;
  nome: string;
  email: string;
  setor: string;
  avatarPath: string | null;
}

export interface Doc {
  id: string;
  title: string;
  summary: string | null;
  contentMd: string;
  categoryId: string;
  status: DocStatus;
  sector: string | null;
  ownerUserId: string | null;
  reviewDueAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  category: DocCategory;
  owner: DocOwner | null;
  tags: string[];
  links: DocLink[];
}

export interface DocListItem
  extends Omit<Doc, "category" | "owner" | "links"> {
  categoryName: string;
  categorySlug: string;
  ownerName: string | null;
  updatedByName: string | null;
}

export interface DocActivityItem {
  id: string;
  docId: string;
  userId: string;
  userName: string;
  action: "created" | "updated" | "published" | "archived";
  createdAt: string | null;
}

export interface DocFilters {
  search?: string;
  categoryId?: string;
  status?: DocStatus;
  sector?: string;
  tag?: string;
  entityType?: DocLinkType;
  entityId?: string;
  limit?: number;
}

export interface DocListPage {
  items: DocListItem[];
  nextCursor: string | null;
  total: number;
}

export interface DocWriteInput {
  title: string;
  summary?: string;
  contentMd?: string;
  categoryId: string;
  status?: DocStatus;
  sector?: string;
  ownerUserId?: string;
  reviewDueAt?: string | null;
  tags?: string[];
  links?: Omit<DocLink, "id" | "docId" | "createdAt">[];
}

export type DocUpdateInput = Partial<DocWriteInput>;

async function parseData<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new HttpError(
      response.status,
      body.error?.message ?? `Erro ${response.status}`,
    );
  }
  return body.data as T;
}

function docsUrl(filters: DocFilters, cursor?: string | null) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  return query ? `/api/db/docs?${query}` : "/api/db/docs";
}

export async function listDocsClient(
  filters: DocFilters,
  cursor?: string | null,
): Promise<DocListPage> {
  return parseData<DocListPage>(
    await fetchWithAuth(docsUrl(filters, cursor)),
  );
}

export async function getDocClient(id: string): Promise<Doc> {
  return parseData<Doc>(await fetchWithAuth(`/api/db/docs/${id}`));
}

export async function createDocClient(input: DocWriteInput): Promise<Doc> {
  return parseData<Doc>(
    await fetchWithAuth("/api/db/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function updateDocClient(
  id: string,
  input: DocUpdateInput,
): Promise<Doc> {
  return parseData<Doc>(
    await fetchWithAuth(`/api/db/docs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function deleteDocClient(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/db/docs/${id}`, {
    method: "DELETE",
  });
  if (response.status === 204) return;
  await parseData<never>(response);
}

export async function listDocActivityClient(
  id: string,
): Promise<DocActivityItem[]> {
  return parseData<DocActivityItem[]>(
    await fetchWithAuth(`/api/db/docs/${id}/activity`),
  );
}

export async function listDocCategoriesClient(): Promise<DocCategory[]> {
  return parseData<DocCategory[]>(
    await fetchWithAuth("/api/db/doc-categories"),
  );
}

export async function createDocCategoryClient(input: {
  name: string;
  slug: string;
  sortOrder?: number;
}): Promise<DocCategory> {
  return parseData<DocCategory>(
    await fetchWithAuth("/api/db/doc-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function searchDocTagsClient(search: string): Promise<string[]> {
  const params = new URLSearchParams({ search });
  const rows = await parseData<Array<{ id: string; label: string }>>(
    await fetchWithAuth(`/api/db/doc-tags?${params}`),
  );
  return rows.map((row) => row.label);
}
