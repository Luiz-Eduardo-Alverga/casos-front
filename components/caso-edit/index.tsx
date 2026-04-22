"use client";

import { useProjetoMemoriaById } from "@/hooks/use-projeto-memoria-by-id";
import { CasoEditForm } from "./caso-edit-form";
import { CasoEditSkeleton } from "./caso-edit-skeleton";

export interface CasoEditViewProps {
  casoId: string;
}

export function CasoEditView({ casoId }: CasoEditViewProps) {
  const { data, isLoading, isError } = useProjetoMemoriaById(casoId);
  const item = data?.data ?? null;

  if (isLoading || !item) {
    return <CasoEditSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px]">
        <p className="text-sm text-destructive">Erro ao carregar o caso.</p>
      </div>
    );
  }

  return <CasoEditForm item={item} casoId={casoId} />;
}
