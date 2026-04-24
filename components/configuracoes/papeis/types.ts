import type { PermissionModuleWithPermissions } from "@/lib/db/permission-modules";
import type { RoleWithPermissionCountRow } from "@/lib/db/roles";

export type RoleWithCount = RoleWithPermissionCountRow;
export type PermissionModuleWithPerms = PermissionModuleWithPermissions;

export interface RoleInfoFormValues {
  name: string;
  description: string;
}

export interface ModuleCoverage {
  total: number;
  active: number;
  /** 'full' se todos ativos, 'partial' se alguns, 'none' se nenhum. */
  state: "full" | "partial" | "none";
}
