"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { produtoIniciais } from "@/components/produtos/utils";

interface ProdutoPessoaChipProps {
  nome: string | null | undefined;
}

export function ProdutoPessoaChip({ nome }: ProdutoPessoaChipProps) {
  const label = nome?.trim() || "—";
  if (label === "—") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
          {produtoIniciais(label)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm text-foreground">{label}</span>
    </span>
  );
}
