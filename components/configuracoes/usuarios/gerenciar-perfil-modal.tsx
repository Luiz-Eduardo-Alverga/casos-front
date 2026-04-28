"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Save, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PapelItem, UsuarioListItem } from "./types";
import Image from "next/image";

interface GerenciarPerfilModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UsuarioListItem | null;
  roles: PapelItem[];
  isLoadingRoles: boolean;
  isSaving: boolean;
  onConfirm: (nextRoleId: string) => Promise<void> | void;
}

export function GerenciarPerfilModal({
  open,
  onOpenChange,
  user,
  roles,
  isLoadingRoles,
  isSaving,
  onConfirm,
}: GerenciarPerfilModalProps) {
  const currentRoleByName = useMemo(() => {
    if (!user?.roleName) return null;
    return roles.find((role) => role.name === user.roleName) ?? null;
  }, [roles, user?.roleName]);

  const [selectedRoleId, setSelectedRoleId] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedRoleId(currentRoleByName?.id ?? "");
  }, [open, currentRoleByName?.id]);

  const canSave = selectedRoleId.length > 0 && !isSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] overflow-hidden p-0 gap-0 border-border-divider">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <Image
              src="/images/shield.svg"
              alt="Perfis de acesso"
              width={20}
              height={20}
            />
            <DialogTitle className="text-xl leading-none sm:text-xl font-bold tracking-[-0.02em]">
              Atribuir Perfil
            </DialogTitle>
          </div>
          <DialogDescription className="mt-1 text-sm font-medium text-text-secondary">
            Atribuindo perfil a{" "}
            <span className="text-text-primary">{user?.nome ?? "-"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
              {roles.length === 0 && (
                <p className="text-sm text-text-secondary py-2">
                  {isLoadingRoles
                    ? "Carregando perfis..."
                    : "Nenhum perfil disponível."}
                </p>
              )}
              {roles.map((role) => {
                const selected = selectedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={cn(
                      "w-full text-left rounded-xl border px-4 py-3.5 transition-colors shadow-sm cursor-pointer",
                      "flex items-start gap-3",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-papeis-role-active-border bg-papeis-role-active-bg text-papeis-role-active-text"
                        : "border-border bg-background hover:bg-muted/40 text-text-primary",
                      (isLoadingRoles || isSaving) &&
                        "opacity-60 cursor-not-allowed",
                    )}
                  >
                    <Checkbox
                      checked={selected}
                      className={cn(
                        "pointer-events-none mt-0.5 h-[21px] w-[21px] rounded-[4px] border-2 shrink-0",
                        "data-[state=checked]:border-papeis-role-active-indicator data-[state=checked]:bg-papeis-role-active-indicator data-[state=checked]:text-white",
                        !selected && "border-border-input bg-background",
                      )}
                      aria-hidden
                    />
                    <span className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          selected
                            ? "text-papeis-role-active-text"
                            : "text-text-primary",
                        )}
                      >
                        {role.name}
                      </span>
                      <span className="text-xs text-text-secondary leading-5 mt-1">
                        {role.description?.trim() ||
                          "Acesso total e irrestrito a todos os módulos do sistema"}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border-divider flex-row gap-4 sm:gap-4 sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1 text-base font-semibold"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(selectedRoleId)}
            disabled={!canSave}
            className="flex-1 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Salvar perfil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
