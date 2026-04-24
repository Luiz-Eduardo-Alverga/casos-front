"use client";

import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

interface PapeisEAcessosHeaderCardProps {
  isDirty: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
  mode?: "edit" | "create";
}

export const PapeisEAcessosHeaderCard = ({
  isDirty,
  isSaving,
  onDiscard,
  onSave,
  mode = "edit",
}: PapeisEAcessosHeaderCardProps) => {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-5 border-b border-border-divider">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-text-primary">
              {mode === "edit"
                ? "Editar Perfil de Acesso"
                : "Criar Perfil de Acesso"}
            </h1>
            <p className="text-sm text-text-secondary">
              {mode === "edit"
                ? "Ajuste as permissões e informações básicas do grupo."
                : "Crie um novo perfil de acesso para o grupo."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              type="button"
              className="w-full sm:w-auto px-4"
              disabled={!isDirty || isSaving}
              onClick={onDiscard}
            >
              <X className="h-3.5 w-3.5" />
              Descartar
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto px-4"
              disabled={!isDirty || isSaving}
              onClick={onSave}
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
