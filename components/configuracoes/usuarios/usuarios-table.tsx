"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsuarioListItem } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface UsuariosTableProps {
  rows: UsuarioListItem[];
  onManageProfile?: (row: UsuarioListItem) => void;
  isFetchingNextPage?: boolean;
}

function LoadingMoreRow() {
  return (
    <TableRow>
      <TableCell className="py-3" colSpan={4}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function UsuariosTable({
  rows,
  onManageProfile,
  isFetchingNextPage = false,
}: UsuariosTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nenhum usuário encontrado"
        description="Ajuste a busca para localizar usuários por nome ou e-mail."
        className="min-h-[260px]"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[34%]">Usuário</TableHead>
          <TableHead className="w-[20%]">Setor</TableHead>
          <TableHead className="w-[26%]">Perfil de acesso</TableHead>
          <TableHead className="w-[20%] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="py-3">
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">{row.nome}</span>
                <span className="text-xs text-text-secondary">{row.email}</span>
              </div>
            </TableCell>
            <TableCell className="py-3">{row.setor}</TableCell>
            <TableCell className="py-3">
              {row.roleName ? (
                <Badge variant="secondary" className="inline-flex gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {row.roleName}
                </Badge>
              ) : (
                <Badge variant="outline">Sem perfil</Badge>
              )}
            </TableCell>
            <TableCell className="py-3 text-right">
              {onManageProfile ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onManageProfile(row)}
                >
                  Gerenciar Perfil
                </Button>
              ) : (
                <span className="text-xs text-text-secondary">Sem permissão</span>
              )}
            </TableCell>
          </TableRow>
        ))}
        {isFetchingNextPage ? (
          <>
            <LoadingMoreRow />
            <LoadingMoreRow />
          </>
        ) : null}
      </TableBody>
    </Table>
  );
}

