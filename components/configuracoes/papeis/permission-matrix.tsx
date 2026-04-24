"use client";

import { ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { PermissionModuleCard } from "./permission-module-card";
import type { PermissionModuleWithPerms } from "./types";

interface PermissionMatrixProps {
  modules: PermissionModuleWithPerms[];
  selected: Set<string>;
  onToggleModule: (module: PermissionModuleWithPerms, active: boolean) => void;
  onTogglePermission: (permissionId: string, active: boolean) => void;
}

/** Card "Matriz de Permissões" com a lista de `PermissionModuleCard`. */
export function PermissionMatrix({
  modules,
  selected,
  onToggleModule,
  onTogglePermission,
}: PermissionMatrixProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Matriz de Permissões
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        {modules.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Sem módulos de permissões"
            description="Cadastre módulos e permissões em /api/db/permission-modules antes de atribuí-las a um papel."
          />
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <PermissionModuleCard
                key={module.id}
                module={module}
                selected={selected}
                onToggleModule={(active) => onToggleModule(module, active)}
                onTogglePermission={onTogglePermission}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
