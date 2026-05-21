"use client";

import { Plus, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import type { SgpUsuarioProjetoItem } from "@/interfaces/sgp-usuario-projeto";
import { UsuariosGrid } from "@/components/projetos/edicao/stakes/usuarios-grid";

export interface UsuariosAutorizadosCardProps {
  usuarios: SgpUsuarioProjetoItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function UsuariosAutorizadosCard({
  usuarios,
  isLoading,
  isError,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UsuariosAutorizadosCardProps) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <UserCheck className="h-4 w-4 text-text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-text-primary">
              Usuários autorizados
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={() => toast("Em breve")}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {isLoading ? null : isError ? (
          <p className="text-sm text-destructive">
            {errorMessage ?? "Erro ao carregar usuários autorizados."}
          </p>
        ) : usuarios.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Nenhum usuário autorizado"
            description="Este projeto ainda não possui usuários autorizados vinculados."
            className="min-h-[120px]"
          />
        ) : (
          <UsuariosGrid
            usuarios={usuarios}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={onLoadMore}
          />
        )}
      </CardContent>
    </Card>
  );
}
