"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface ProdutoAcoesCardProps {
  desativado: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ProdutoAcoesCard({
  desativado,
  onToggle,
  disabled = false,
}: ProdutoAcoesCardProps) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-text-primary">
          {PRODUTO_LABELS.acoes}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <p className="mb-4 text-xs text-text-secondary">
          {desativado
            ? PRODUTO_LABELS.reativarAjuda
            : PRODUTO_LABELS.desativarAjuda}
        </p>
        <Button
          type="button"
          variant="outline"
          className={
            desativado
              ? "w-full"
              : "w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          }
          onClick={onToggle}
          disabled={disabled}
        >
          {desativado
            ? PRODUTO_LABELS.reativarProduto
            : PRODUTO_LABELS.desativarProduto}
        </Button>
      </CardContent>
    </Card>
  );
}
