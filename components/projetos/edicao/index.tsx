"use client";

import { useSgpCadastroById } from "@/hooks/projetos/use-sgp-cadastro-by-id";
import { isHttpError } from "@/lib/http-error";
import { ProjetoEditForm } from "@/components/projetos/edicao/projeto-edit-form";
import { ProjetoEditSkeleton } from "@/components/projetos/edicao/projeto-edit-skeleton";
import { ProjetoNaoEncontrado } from "@/components/projetos/edicao/projeto-nao-encontrado";

export interface ProjetoEditViewProps {
  projetoId: string;
}

export function ProjetoEditView({ projetoId }: ProjetoEditViewProps) {
  const { data, isLoading, isError, error } = useSgpCadastroById(projetoId);
  const cadastro = data?.data ?? null;

  if (isLoading) {
    return <ProjetoEditSkeleton />;
  }

  if (isError) {
    if (isHttpError(error) && error.status === 404) {
      return <ProjetoNaoEncontrado projetoId={projetoId} />;
    }
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Erro ao carregar o projeto."}
        </p>
      </div>
    );
  }

  if (!cadastro) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Dados do projeto indisponíveis.
        </p>
      </div>
    );
  }

  return <ProjetoEditForm cadastro={cadastro} projetoId={projetoId} />;
}
