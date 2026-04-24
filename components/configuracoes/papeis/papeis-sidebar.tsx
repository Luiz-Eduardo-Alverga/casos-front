"use client";

import { Plus, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/painel/empty-state";
import { RoleSidebarCard } from "./role-sidebar-card";
import type { RoleWithCount } from "./types";
import Image from "next/image";

interface PapeisSidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roles: RoleWithCount[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onCreateNew: () => void;
  isCreatingNew: boolean;
  hasSearchActive: boolean;
}

/** Painel esquerdo: botão Novo Perfil, busca e lista de papéis. */
export function PapeisSidebar({
  search,
  onSearchChange,
  roles,
  selectedRoleId,
  onSelectRole,
  onCreateNew,
  isCreatingNew,
  hasSearchActive,
}: PapeisSidebarProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          {/* <Shield className="h-3.5 w-3.5 text-text-primary" /> */}
          <Image
            src="/images/shield.svg"
            alt="Perfis de acesso"
            width={24}
            height={24}
          />
          <CardTitle className="text-lg font-semibold text-text-primary">
            Perfis de acesso
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto space-y-4">
        <Button
          type="button"
          onClick={onCreateNew}
          className="w-full"
          disabled={isCreatingNew}
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Perfil
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar papel..."
            aria-label="Buscar papéis"
            className="pl-9"
          />
        </div>

        {roles.length === 0 ? (
          <EmptyState
            icon={Shield}
            title={hasSearchActive ? "Nenhum papel encontrado" : "Sem papéis"}
            description={
              hasSearchActive
                ? "Ajuste o termo da busca ou crie um novo perfil."
                : "Clique em Novo Perfil para criar o primeiro papel."
            }
          />
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <RoleSidebarCard
                key={role.id}
                role={role}
                isActive={!isCreatingNew && role.id === selectedRoleId}
                onClick={() => onSelectRole(role.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
