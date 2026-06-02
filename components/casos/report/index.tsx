"use client";

import { useProjetoMemoriaById } from "@/hooks/casos/use-projeto-memoria-by-id";
import { isHttpError } from "@/lib/http-error";
import { ReportEditForm } from "./report-edit-form";
import { ReportEditSkeleton } from "./report-edit-skeleton";
import { CasoNaoEncontrado } from "@/components/casos/edicao/caso-nao-encontrado";

export {
  CasoEditProvider,
  useCasoEdit,
} from "@/components/casos/edicao/caso-edit-context";

export interface ReportEditViewProps {
  casoId: string;
}

export function ReportEditView({ casoId }: ReportEditViewProps) {
  const { data, isLoading, isError, error } = useProjetoMemoriaById(casoId);
  const item = data?.data ?? null;

  if (isLoading) {
    return <ReportEditSkeleton />;
  }

  if (isError) {
    if (isHttpError(error) && error.status === 404) {
      return <CasoNaoEncontrado casoId={casoId} />;
    }
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Erro ao carregar o report."}
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Dados do report indisponíveis.
        </p>
      </div>
    );
  }

  return <ReportEditForm item={item} casoId={casoId} />;
}
