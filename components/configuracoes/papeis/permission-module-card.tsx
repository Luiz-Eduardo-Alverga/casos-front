"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getModuleIcon } from "./icons";
import { PermissionCheckCard } from "./permission-check-card";
import { computeModuleCoverage } from "./utils";
import type { PermissionModuleWithPerms } from "./types";

interface PermissionModuleCardProps {
  module: PermissionModuleWithPerms;
  selected: Set<string>;
  onToggleModule: (active: boolean) => void;
  onTogglePermission: (permissionId: string, active: boolean) => void;
}

/**
 * Card de um módulo: cabeçalho com ícone, contagem `M de N permissões ativas`,
 * switch "Acesso Total / Parcial" e grade de `PermissionCheckCard`.
 */
export function PermissionModuleCard({
  module,
  selected,
  onToggleModule,
  onTogglePermission,
}: PermissionModuleCardProps) {
  const Icon = getModuleIcon(module.slug);
  const coverage = computeModuleCoverage(module, selected);
  const hasAny = coverage.state !== "none";

  return (
    <div className="rounded-md border border-border-divider p-4">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-4 flex-col sm:flex-row">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "h-9 w-9 rounded-md flex items-center justify-center shrink-0",
              hasAny
                ? "bg-papeis-module-icon-active-bg"
                : "bg-papeis-module-icon-muted-bg",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                hasAny
                  ? "text-papeis-role-active-text"
                  : "text-text-secondary",
              )}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate">
              {module.name}
            </span>
            <span className="text-xs text-text-secondary">
              {coverage.active} de {coverage.total} permissões ativas
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-xs font-medium",
              coverage.state === "full"
                ? "text-papeis-role-active-text"
                : "text-text-secondary",
            )}
          >
            {coverage.state === "full" ? "Acesso Total" : "Acesso Parcial"}
          </span>
          <Switch
            aria-label="Ativar/desativar todas as permissões do módulo"
            checked={coverage.state === "full"}
            onCheckedChange={(value) => onToggleModule(value === true)}
            disabled={coverage.total === 0}
          />
        </div>
      </div>

      {coverage.total === 0 ? (
        <p className="text-xs text-text-secondary italic">
          Este módulo não possui permissões cadastradas.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {module.permissions.map((perm) => (
            <PermissionCheckCard
              key={perm.id}
              id={perm.id}
              label={perm.label}
              description={perm.description}
              checked={selected.has(perm.id)}
              onToggle={(active) => onTogglePermission(perm.id, active)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
