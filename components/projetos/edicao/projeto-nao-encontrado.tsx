"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjetoNaoEncontradoProps {
  projetoId: string;
  className?: string;
}

export function ProjetoNaoEncontrado({
  projetoId,
  className,
}: ProjetoNaoEncontradoProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center text-center",
        className,
      )}
    >
      <div className="space-y-6">
        <Image
          src="/images/404.svg"
          alt=""
          width={364}
          height={345}
          className="mx-auto h-auto w-full max-w-[260px] select-none"
        />
        <div className="mt-3 space-y-6">
          <h1 className="text-3xl font-bold leading-[0.95] text-foreground">
            Projeto #{projetoId} não encontrado
          </h1>
          <p className="mx-auto max-w-[620px] text-lg font-medium leading-relaxed text-text-secondary">
            O projeto que você está tentando acessar não existe, foi excluído ou
            você não tem permissão para visualizá-lo.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild className="sm:min-w-[170px]">
            <Link href="/projetos">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Listagem
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
