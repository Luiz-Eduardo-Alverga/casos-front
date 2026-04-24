import { fetchWithAuth } from "@/lib/fetch";
import type { AppUserRow, AppUserWithRoles } from "@/lib/db/app-users";
import type {
  PermissionModuleRow,
  PermissionModuleWithPermissions,
} from "@/lib/db/permission-modules";
import type { PermissionRow, PermissionWithModule } from "@/lib/db/permissions";
import type {
  RolePermissionWithDetails,
  SyncRolePermissionsResult,
} from "@/lib/db/role-permissions";
import type { RoleRow, RoleWithPermissionCountRow } from "@/lib/db/roles";
import type { PermissionModuleCreateInput } from "@/lib/validators/db/permission-modules";
import type { PermissionModuleUpdateInput } from "@/lib/validators/db/permission-modules";
import type { PermissionCreateInput, PermissionUpdateInput } from "@/lib/validators/db/permissions";
import type { RoleCreateInput, RoleUpdateInput } from "@/lib/validators/db/roles";

interface ApiDbResponse<T> {
  data?: T;
  error?: { message?: string };
}

function readErrorMessage(json: ApiDbResponse<unknown>, status: number): string {
  return typeof json?.error?.message === "string"
    ? json.error.message
    : `Erro ${status}`;
}

async function parseJson<T>(response: Response): Promise<ApiDbResponse<T>> {
  return (await response.json().catch(() => ({}))) as ApiDbResponse<T>;
}

async function parseSuccessWithData<T>(response: Response): Promise<T> {
  const json = await parseJson<T>(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(json, response.status));
  }
  if (!json.data) {
    throw new Error("Resposta inválida da API");
  }
  return json.data;
}

async function parseSuccessWithoutData(response: Response): Promise<void> {
  if (response.status === 204) return;
  const json = await parseJson(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(json, response.status));
  }
}

function buildPermissionModulesUrl(
  search?: string,
  expand?: "permissions",
): string {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (expand) params.set("expand", expand);
  const qs = params.toString();
  return qs ? `/api/db/permission-modules?${qs}` : "/api/db/permission-modules";
}

export async function listPermissionModulesClient(
  search?: string,
  expand?: "permissions",
): Promise<
  PermissionModuleRow[] | PermissionModuleWithPermissions[]
> {
  const res = await fetchWithAuth(buildPermissionModulesUrl(search, expand));
  return parseSuccessWithData(res);
}

export async function createPermissionModuleClient(
  input: PermissionModuleCreateInput,
): Promise<PermissionModuleRow> {
  const res = await fetchWithAuth("/api/db/permission-modules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<PermissionModuleRow>(res);
}

export async function getPermissionModuleByIdClient(
  id: string,
  expand?: "permissions",
): Promise<PermissionModuleRow | PermissionModuleWithPermissions> {
  const q = expand ? `?expand=${expand}` : "";
  const res = await fetchWithAuth(`/api/db/permission-modules/${id}${q}`);
  return parseSuccessWithData(res);
}

export async function updatePermissionModuleClient(
  id: string,
  input: PermissionModuleUpdateInput,
): Promise<PermissionModuleRow> {
  const res = await fetchWithAuth(`/api/db/permission-modules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<PermissionModuleRow>(res);
}

export async function deletePermissionModuleClient(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/db/permission-modules/${id}`, {
    method: "DELETE",
  });
  return parseSuccessWithoutData(res);
}

function buildPermissionsUrl(search?: string, moduleId?: string): string {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (moduleId?.trim()) params.set("moduleId", moduleId.trim());
  const qs = params.toString();
  return qs ? `/api/db/permissions?${qs}` : "/api/db/permissions";
}

export async function listPermissionsClient(
  search?: string,
  moduleId?: string,
): Promise<PermissionRow[]> {
  const res = await fetchWithAuth(buildPermissionsUrl(search, moduleId));
  return parseSuccessWithData<PermissionRow[]>(res);
}

export async function createPermissionClient(
  input: PermissionCreateInput,
): Promise<PermissionRow> {
  const res = await fetchWithAuth("/api/db/permissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<PermissionRow>(res);
}

export async function getPermissionByIdClient(
  id: string,
  expand?: "module",
): Promise<PermissionRow | PermissionWithModule> {
  const q = expand ? `?expand=${expand}` : "";
  const res = await fetchWithAuth(`/api/db/permissions/${id}${q}`);
  return parseSuccessWithData(res);
}

export async function updatePermissionClient(
  id: string,
  input: PermissionUpdateInput,
): Promise<PermissionRow> {
  const res = await fetchWithAuth(`/api/db/permissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<PermissionRow>(res);
}

export async function deletePermissionClient(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/db/permissions/${id}`, {
    method: "DELETE",
  });
  return parseSuccessWithoutData(res);
}

function withSearch(path: string, search?: string): string {
  const q = search?.trim();
  return q ? `${path}?search=${encodeURIComponent(q)}` : path;
}

function buildRolesUrl(search?: string, expand?: "permissionsCount"): string {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (expand) params.set("expand", expand);
  const qs = params.toString();
  return qs ? `/api/db/roles?${qs}` : "/api/db/roles";
}

export async function listRolesClient(search?: string): Promise<RoleRow[]> {
  const res = await fetchWithAuth(buildRolesUrl(search));
  return parseSuccessWithData<RoleRow[]>(res);
}

export async function listRolesWithCountClient(
  search?: string,
): Promise<RoleWithPermissionCountRow[]> {
  const res = await fetchWithAuth(buildRolesUrl(search, "permissionsCount"));
  return parseSuccessWithData<RoleWithPermissionCountRow[]>(res);
}

export async function createRoleClient(input: RoleCreateInput): Promise<RoleRow> {
  const res = await fetchWithAuth("/api/db/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<RoleRow>(res);
}

export async function getRoleByIdClient(id: string): Promise<RoleRow> {
  const res = await fetchWithAuth(`/api/db/roles/${id}`);
  return parseSuccessWithData<RoleRow>(res);
}

export async function updateRoleClient(
  id: string,
  input: RoleUpdateInput,
): Promise<RoleRow> {
  const res = await fetchWithAuth(`/api/db/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<RoleRow>(res);
}

export async function deleteRoleClient(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/db/roles/${id}`, { method: "DELETE" });
  return parseSuccessWithoutData(res);
}

export async function listRolePermissionsClient(
  roleId: string,
): Promise<RolePermissionWithDetails[]> {
  const res = await fetchWithAuth(`/api/db/roles/${roleId}/permissions`);
  return parseSuccessWithData<RolePermissionWithDetails[]>(res);
}

export async function linkRolePermissionClient(
  roleId: string,
  permissionId: string,
): Promise<{ roleId: string; permissionId: string }> {
  const res = await fetchWithAuth(`/api/db/roles/${roleId}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissionId }),
  });
  return parseSuccessWithData(res);
}

export type LinkRolePermissionsBatchData = {
  items: { roleId: string; permissionId: string }[];
  skippedPermissionIds: string[];
};

export async function linkRolePermissionsClient(
  roleId: string,
  permissionIds: string[],
): Promise<LinkRolePermissionsBatchData> {
  const res = await fetchWithAuth(`/api/db/roles/${roleId}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissionIds }),
  });
  return parseSuccessWithData<LinkRolePermissionsBatchData>(res);
}

/**
 * PUT sync: lista completa e final de `permissionIds`.
 * Array vazio remove todos os vínculos existentes.
 */
export async function syncRolePermissionsClient(
  roleId: string,
  permissionIds: string[],
): Promise<SyncRolePermissionsResult> {
  const res = await fetchWithAuth(`/api/db/roles/${roleId}/permissions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissionIds }),
  });
  return parseSuccessWithData<SyncRolePermissionsResult>(res);
}

export async function unlinkRolePermissionClient(
  roleId: string,
  permissionId: string,
): Promise<void> {
  const res = await fetchWithAuth(
    `/api/db/roles/${roleId}/permissions/${permissionId}`,
    { method: "DELETE" },
  );
  return parseSuccessWithoutData(res);
}

export async function listAppUsersClient(search?: string): Promise<AppUserRow[]> {
  const res = await fetchWithAuth(withSearch("/api/db/app-users", search));
  return parseSuccessWithData<AppUserRow[]>(res);
}

export async function getAppUserByIdClient(
  id: string,
  expand?: "roles",
): Promise<AppUserRow | AppUserWithRoles> {
  const q = expand ? `?expand=${expand}` : "";
  const res = await fetchWithAuth(`/api/db/app-users/${id}${q}`);
  return parseSuccessWithData(res);
}

export async function listAppUserRolesClient(userId: string): Promise<RoleRow[]> {
  const res = await fetchWithAuth(`/api/db/app-users/${userId}/roles`);
  return parseSuccessWithData<RoleRow[]>(res);
}

export async function linkAppUserRoleClient(
  userId: string,
  roleId: string,
): Promise<{ userId: string; roleId: string }> {
  const res = await fetchWithAuth(`/api/db/app-users/${userId}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roleId }),
  });
  return parseSuccessWithData(res);
}

export async function unlinkAppUserRoleClient(
  userId: string,
  roleId: string,
): Promise<void> {
  const res = await fetchWithAuth(
    `/api/db/app-users/${userId}/roles/${roleId}`,
    { method: "DELETE" },
  );
  return parseSuccessWithoutData(res);
}
