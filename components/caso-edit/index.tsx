"use client";

import { useProjetoMemoriaById } from "@/hooks/use-projeto-memoria-by-id";
import { isHttpError } from "@/lib/http-error";
import { CasoEditForm } from "./caso-edit-form";
import { CasoEditSkeleton } from "./caso-edit-skeleton";
import { CasoNaoEncontrado } from "./caso-nao-encontrado";

export { CasoEditProvider, useCasoEdit } from "./caso-edit-context";

export interface CasoEditViewProps {
  casoId: string;
}

export function CasoEditView({ casoId }: CasoEditViewProps) {
  const { data, isLoading, isError, error } = useProjetoMemoriaById(casoId);
  const item = data?.data ?? null;

  if (isLoading) {
    return <CasoEditSkeleton />;
  }

  if (isError) {
    if (isHttpError(error) && error.status === 404) {
      return <CasoNaoEncontrado casoId={casoId} />;
    }
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar o caso."}
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Dados do caso indisponíveis.
        </p>
      </div>
    );
  }

  return <CasoEditForm item={item} casoId={casoId} />;
}
