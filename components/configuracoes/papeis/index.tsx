"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDbRolesWithCount } from "@/hooks/use-db-roles-with-count";
import { useDbRolePermissions } from "@/hooks/use-db-role-permissions";
import { useDbPermissionModulesWithPermissions } from "@/hooks/use-db-permission-modules-with-permissions";
import { useSyncRolePermissions } from "@/hooks/use-sync-role-permissions";
import { useCreateRole, useUpdateRole } from "@/hooks/use-db-roles";
import { EmptySelectionState } from "./empty-selection-state";
import { PapeisEAcessosSkeleton } from "./papeis-e-acessos-skeleton";
import { PapeisSidebar } from "./papeis-sidebar";
import { PapeisSidebarSkeleton } from "./papeis-sidebar-skeleton";
import { PermissionMatrix } from "./permission-matrix";
import { PermissionMatrixSkeleton } from "./permission-matrix-skeleton";
import { PapeisEAcessosHeaderCard } from "./papeis-e-acessos-header-card";
import { RoleInfoCard } from "./role-info-card";
import type {
  PermissionModuleWithPerms,
  RoleInfoFormValues,
  RoleWithCount,
} from "./types";
import { arePermissionSetsEqual } from "./utils";

interface PapeisEAcessosProps {
  initialSearch: string;
  initialRoleId: string;
}

const DEBOUNCE_MS = 300;
const EMPTY_ROLES: RoleWithCount[] = [];
const EMPTY_MODULES: PermissionModuleWithPerms[] = [];

export function PapeisEAcessos({
  initialSearch,
  initialRoleId,
}: PapeisEAcessosProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_MS);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    initialRoleId || null,
  );
  const [creatingNew, setCreatingNew] = useState(false);

  const rolesQuery = useDbRolesWithCount(debouncedSearch);
  const modulesQuery = useDbPermissionModulesWithPermissions();
  const rolePermissionsQuery = useDbRolePermissions(selectedRoleId);

  const rolesList = rolesQuery.data ?? EMPTY_ROLES;
  const modulesList = modulesQuery.data ?? EMPTY_MODULES;

  const syncMutation = useSyncRolePermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const form = useForm<RoleInfoFormValues>({
    mode: "onSubmit",
    defaultValues: { name: "", description: "" },
  });
  const { reset: resetForm, formState, getValues, trigger } = form;

  /** IDs vindos do servidor para o papel atual — referência para comparação. */
  const serverPermissionIds = useMemo(() => {
    if (creatingNew) return new Set<string>();
    if (!rolePermissionsQuery.data) return null;
    return new Set(rolePermissionsQuery.data.map((r) => r.permissionId));
  }, [creatingNew, rolePermissionsQuery.data]);

  const [matrix, setMatrix] = useState<Set<string>>(new Set());
  const lastSyncedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (creatingNew) {
      const key = "__new__";
      if (lastSyncedKeyRef.current !== key) {
        setMatrix(new Set());
        resetForm({ name: "", description: "" });
        lastSyncedKeyRef.current = key;
      }
      return;
    }
    if (!selectedRoleId) {
      lastSyncedKeyRef.current = null;
      return;
    }
    if (!serverPermissionIds) return;
    const role = rolesList.find((r) => r.id === selectedRoleId);
    if (!role) return;
    const key = `${selectedRoleId}:${role.name}:${role.description ?? ""}:${[...serverPermissionIds].sort().join(",")}`;
    if (lastSyncedKeyRef.current !== key) {
      setMatrix(new Set(serverPermissionIds));
      resetForm({ name: role.name, description: role.description ?? "" });
      lastSyncedKeyRef.current = key;
    }
  }, [creatingNew, selectedRoleId, rolesList, serverPermissionIds, resetForm]);

  useEffect(() => {
    const params = new URLSearchParams();
    const s = debouncedSearch.trim();
    if (s) params.set("search", s);
    if (selectedRoleId) params.set("roleId", selectedRoleId);
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", next);
  }, [debouncedSearch, selectedRoleId, pathname]);

  const infoDirty = formState.isDirty;
  const matrixDirty = creatingNew
    ? matrix.size > 0
    : serverPermissionIds
      ? !arePermissionSetsEqual(matrix, serverPermissionIds)
      : false;
  const isDirty = creatingNew || infoDirty || matrixDirty;

  const isSaving =
    syncMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending;

  const [pendingAction, setPendingAction] = useState<
    { type: "select"; roleId: string } | { type: "create-new" } | null
  >(null);

  const performSelect = useCallback((roleId: string) => {
    setCreatingNew(false);
    setSelectedRoleId(roleId);
    lastSyncedKeyRef.current = null;
  }, []);

  const performCreateNew = useCallback(() => {
    setCreatingNew(true);
    setSelectedRoleId(null);
    lastSyncedKeyRef.current = null;
  }, []);

  const handleSelectRole = (roleId: string) => {
    if (creatingNew || isDirty) {
      setPendingAction({ type: "select", roleId });
      return;
    }
    performSelect(roleId);
  };

  const handleCreateNew = () => {
    if (isDirty) {
      setPendingAction({ type: "create-new" });
      return;
    }
    performCreateNew();
  };

  const handleConfirmDiscardNav = async () => {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    if (action.type === "select") performSelect(action.roleId);
    else performCreateNew();
  };

  const handleDiscard = () => {
    if (creatingNew) {
      setMatrix(new Set());
      resetForm({ name: "", description: "" });
      return;
    }
    if (!selectedRoleId) return;
    const role = rolesList.find((r) => r.id === selectedRoleId);
    if (role)
      resetForm({ name: role.name, description: role.description ?? "" });
    if (serverPermissionIds) setMatrix(new Set(serverPermissionIds));
  };

  const handleToggleModule = (
    module: PermissionModuleWithPerms,
    active: boolean,
  ) => {
    setMatrix((prev) => {
      const next = new Set(prev);
      for (const p of module.permissions) {
        if (active) next.add(p.id);
        else next.delete(p.id);
      }
      return next;
    });
  };

  const handleTogglePermission = (permissionId: string, active: boolean) => {
    setMatrix((prev) => {
      const next = new Set(prev);
      if (active) next.add(permissionId);
      else next.delete(permissionId);
      return next;
    });
  };

  const handleSave = async () => {
    const valid = await trigger();
    if (!valid) return;
    const { name, description } = getValues();
    const cleanDescription = description.trim() ? description.trim() : null;

    try {
      if (creatingNew) {
        const created = await createMutation.mutateAsync({
          name: name.trim(),
          description: cleanDescription,
        });
        if (matrix.size > 0) {
          await syncMutation.mutateAsync({
            roleId: created.id,
            permissionIds: [...matrix],
          });
        }
        toast.success("Papel criado.");
        setCreatingNew(false);
        setSelectedRoleId(created.id);
        lastSyncedKeyRef.current = null;
        return;
      }

      if (!selectedRoleId) return;

      if (infoDirty) {
        await updateMutation.mutateAsync({
          id: selectedRoleId,
          input: { name: name.trim(), description: cleanDescription },
        });
      }
      if (matrixDirty) {
        await syncMutation.mutateAsync({
          roleId: selectedRoleId,
          permissionIds: [...matrix],
        });
      }
      toast.success("Alterações salvas.");
      lastSyncedKeyRef.current = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (rolesQuery.isError && rolesQuery.error) {
      toast.error(rolesQuery.error.message);
    }
  }, [rolesQuery.isError, rolesQuery.error]);

  useEffect(() => {
    if (modulesQuery.isError && modulesQuery.error) {
      toast.error(modulesQuery.error.message);
    }
  }, [modulesQuery.isError, modulesQuery.error]);

  useEffect(() => {
    if (rolePermissionsQuery.isError && rolePermissionsQuery.error) {
      toast.error(rolePermissionsQuery.error.message);
    }
  }, [rolePermissionsQuery.isError, rolePermissionsQuery.error]);

  const hasSearchActive = debouncedSearch.trim().length > 0;

  const pageIsLoading = rolesQuery.isLoading && modulesQuery.isLoading;

  if (pageIsLoading) {
    return <PapeisEAcessosSkeleton />;
  }

  const showMatrixSkeleton =
    modulesQuery.isLoading ||
    (!creatingNew && selectedRoleId !== null && rolePermissionsQuery.isLoading);

  const showRightPanel = creatingNew || Boolean(selectedRoleId);

  return (
    <FormProvider {...form}>
      <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <div className="w-full lg:w-[363px] flex flex-col lg:min-h-0">
            {rolesQuery.isLoading ? (
              <PapeisSidebarSkeleton />
            ) : (
              <PapeisSidebar
                search={search}
                onSearchChange={setSearch}
                roles={rolesList}
                selectedRoleId={selectedRoleId}
                onSelectRole={handleSelectRole}
                onCreateNew={handleCreateNew}
                isCreatingNew={creatingNew}
                hasSearchActive={hasSearchActive}
              />
            )}
          </div>

          <div className="flex flex-col gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            {showRightPanel ? (
              <>
                <PapeisEAcessosHeaderCard
                  mode={creatingNew ? "create" : "edit"}
                  isDirty={isDirty}
                  isSaving={isSaving}
                  onDiscard={handleDiscard}
                  onSave={handleSave}
                />
                <RoleInfoCard />
                {showMatrixSkeleton ? (
                  <PermissionMatrixSkeleton />
                ) : (
                  <PermissionMatrix
                    modules={modulesList}
                    selected={matrix}
                    onToggleModule={handleToggleModule}
                    onTogglePermission={handleTogglePermission}
                  />
                )}
              </>
            ) : (
              <EmptySelectionState />
            )}
          </div>
        </div>

        <ConfirmacaoModal
          open={Boolean(pendingAction)}
          onOpenChange={(next) => {
            if (!next) setPendingAction(null);
          }}
          titulo="Descartar alterações?"
          descricao="Existem alterações não salvas. Se continuar, elas serão perdidas."
          confirmarLabel="Descartar e continuar"
          cancelarLabel="Voltar"
          variant="danger"
          onConfirm={handleConfirmDiscardNav}
        />
      </div>
    </FormProvider>
  );
}
