"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FilterX, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useDbAppUsersInfinite,
  useReplaceAppUserRole,
} from "@/hooks/use-db-app-users";
import { useDbRolesSelectList } from "@/hooks/use-db-roles-select-list";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { GerenciarPerfilModal } from "./gerenciar-perfil-modal";
import type { PapelItem, UsuarioListItem } from "./types";
import { UsuariosTableSkeleton } from "./usuarios-skeleton";
import { UsuariosTable } from "./usuarios-table";

interface ConfiguracoesUsuariosProps {
  initialSearch: string;
}

const DEBOUNCE_MS = 300;
const EMPTY_ROLES: PapelItem[] = [];

export function ConfiguracoesUsuarios({
  initialSearch,
}: ConfiguracoesUsuariosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);

  const usersQuery = useDbAppUsersInfinite(debouncedSearch);
  const rolesQuery = useDbRolesSelectList();
  const replaceRoleMutation = useReplaceAppUserRole();

  const [selectedUser, setSelectedUser] = useState<UsuarioListItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const rbacReady = permissionsLoaded();
  const canAssign = !rbacReady || hasPermission("assign-user-role");

  const rows = useMemo<UsuarioListItem[]>(
    () => usersQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [usersQuery.data],
  );
  const roles = rolesQuery.data ?? EMPTY_ROLES;

  const hasSearchActive = useMemo(
    () => searchInput.trim().length > 0,
    [searchInput],
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasNextPage = usersQuery.hasNextPage;
  const isFetchingNextPage = usersQuery.isFetchingNextPage;
  const fetchNextPage = usersQuery.fetchNextPage;

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    const term = debouncedSearch.trim();
    if (term) params.set("search", term);
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", next);
  }, [debouncedSearch, pathname]);

  useEffect(() => {
    if (usersQuery.isError && usersQuery.error) {
      toast.error(usersQuery.error.message);
    }
  }, [usersQuery.isError, usersQuery.error]);

  useEffect(() => {
    if (rolesQuery.isError && rolesQuery.error) {
      toast.error(rolesQuery.error.message);
    }
  }, [rolesQuery.isError, rolesQuery.error]);

  const handleOpenManageProfile = (row: UsuarioListItem) => {
    if (!canAssign) return;
    setSelectedUser(row);
    setModalOpen(true);
  };

  const handleSaveProfile = async (nextRoleId: string) => {
    if (!selectedUser) return;
    try {
      await replaceRoleMutation.mutateAsync({
        userId: selectedUser.id,
        roleId: nextRoleId,
      });
      toast.success("Perfil atualizado com sucesso.");
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar perfil";
      toast.error(message);
    }
  };

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Usuários</h1>
          <p className="text-sm text-text-secondary">
            Gerencie o perfil de acesso dos usuários da plataforma
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            disabled={!hasSearchActive}
            onClick={() => setSearchInput("")}
          >
            <FilterX className="h-3.5 w-3.5" />
            Limpar busca
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
        </div>
      </div>

      <CadastroFiltrosCard
        fieldLabel="Usuário"
        placeholder="Buscar por nome ou e-mail..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar usuários"
      />

      <CadastroListagemCard title="Listagem de Usuários" icon={Users}>
        {usersQuery.isLoading ? (
          <UsuariosTableSkeleton />
        ) : (
          <>
            <UsuariosTable
              rows={rows}
              onManageProfile={canAssign ? handleOpenManageProfile : undefined}
              isFetchingNextPage={isFetchingNextPage}
            />
            {hasNextPage && rows.length > 0 ? (
              <div ref={loadMoreRef} className="mt-4 min-h-[48px]" />
            ) : null}
          </>
        )}
      </CadastroListagemCard>

      {canAssign && (
        <GerenciarPerfilModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setSelectedUser(null);
          }}
          user={selectedUser}
          roles={roles}
          isLoadingRoles={rolesQuery.isLoading}
          isSaving={replaceRoleMutation.isPending}
          onConfirm={handleSaveProfile}
        />
      )}
    </div>
  );
}

