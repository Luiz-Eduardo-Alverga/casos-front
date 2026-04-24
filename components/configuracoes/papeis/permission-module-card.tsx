"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = getModuleIcon(module.slug);
  const coverage = computeModuleCoverage(module, selected);
  const hasAny = coverage.state !== "none";

  return (
    <div className="rounded-xl border border-border-divider bg-card overflow-hidden">
      <div
        className={cn(
          "px-4 py-4 bg-page-background/40",
          isExpanded && "border-b border-border-divider",
        )}
      >
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
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
              <span className="text-base font-semibold text-text-primary truncate">
                {module.name}
              </span>
              <span className="text-xs text-text-secondary">
                {coverage.active} de {coverage.total} permissões ativas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Switch
              aria-label="Ativar/desativar todas as permissões do módulo"
              checked={coverage.state === "full"}
              onCheckedChange={(value) => onToggleModule(value === true)}
              disabled={coverage.total === 0}
            />
            <span
              className={cn(
                "text-sm font-medium",
                coverage.state === "full"
                  ? "text-papeis-role-active-text"
                  : "text-text-secondary",
              )}
            >
              {coverage.state === "full" ? "Acesso Total" : "Acesso Parcial"}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md p-1 text-text-secondary hover:text-text-primary transition-colors"
              aria-label={isExpanded ? "Recolher módulo" : "Expandir módulo"}
            >
              <ChevronUp
                className={cn(
                  "h-4 w-4 transition-transform",
                  !isExpanded && "-rotate-180",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {isExpanded &&
        (coverage.total === 0 ? (
          <div className="p-4">
            <p className="text-xs text-text-secondary italic">
              Este módulo não possui permissões cadastradas.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          </div>
        ))}
    </div>
  );
}
