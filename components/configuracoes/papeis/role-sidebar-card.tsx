"use client";

import { cn } from "@/lib/utils";
import type { RoleWithCount } from "./types";

interface RoleSidebarCardProps {
  role: RoleWithCount;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Card de papel na lista lateral. Quando ativo, recebe cor e borda `papeis-role-active-*`
 * e uma barra indicadora à esquerda.
 */
export function RoleSidebarCard({
  role,
  isActive,
  onClick,
}: RoleSidebarCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-md border px-4 py-3 transition-colors",
        "flex flex-col gap-1.5",
        isActive
          ? "bg-papeis-role-active-bg border-papeis-role-active-border"
          : "bg-card border-border-divider hover:bg-page-background",
      )}
      aria-pressed={isActive}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-sm bg-papeis-role-active-indicator"
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-sm font-semibold truncate",
            isActive ? "text-papeis-role-active-text" : "text-text-primary",
          )}
        >
          {role.name}
        </span>
        <span
          className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
            "bg-papeis-badge-count-bg text-papeis-badge-count-text",
          )}
        >
          {role.permissionsCount} perm.
        </span>
      </div>
      {role.description && (
        <p className="text-xs text-text-secondary line-clamp-2">
          {role.description}
        </p>
      )}
    </button>
  );
}
