"use client";

import { useLiberacaoByRegistro } from "@/hooks/liberacoes/use-liberacao-by-registro";
import { isHttpError } from "@/lib/http-error";
import { LiberacaoEditForm } from "@/components/liberacoes/edicao/liberacao-edit-form";
import { LiberacaoEditSkeleton } from "@/components/liberacoes/edicao/liberacao-edit-skeleton";
import { LiberacaoNaoEncontrada } from "@/components/liberacoes/edicao/liberacao-nao-encontrada";

export interface LiberacaoEditViewProps {
  registro: string;
}

export function LiberacaoEditView({ registro }: LiberacaoEditViewProps) {
  const { data, isLoading, isError, error } = useLiberacaoByRegistro(registro);
  const liberacao = data?.data ?? null;

  if (isLoading) {
    return <LiberacaoEditSkeleton />;
  }

  if (isError) {
    if (isHttpError(error) && error.status === 404) {
      return <LiberacaoNaoEncontrada registro={registro} />;
    }
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Erro ao carregar o registro de liberação."}
        </p>
      </div>
    );
  }

  if (!liberacao) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Dados da liberação indisponíveis.
        </p>
      </div>
    );
  }

  return <LiberacaoEditForm liberacao={liberacao} />;
}
