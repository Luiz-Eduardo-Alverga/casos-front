"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PapeisDangerZoneCardProps {
  onDelete: () => void;
  disabled?: boolean;
}

export function PapeisDangerZoneCard({
  onDelete,
  disabled = false,
}: PapeisDangerZoneCardProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg border border-border-divider">
      <CardContent className="p-5">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-destructive">Zona de Perigo</h3>

          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-destructive">
                  Excluir este papel
                </p>
                <p className="text-xs text-destructive">
                  Esta ação não pode ser desfeita. Usuários com este perfil
                  perderão seus acessos.
                </p>
              </div>

              <Button
                type="button"
                onClick={onDelete}
                disabled={disabled}
                variant="destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir perfil
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
