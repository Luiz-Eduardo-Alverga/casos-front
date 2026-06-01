"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CasoNaoEncontradoProps {
  casoId: string;
  /** Classes extras no container raiz (ex.: modal). */
  className?: string;
  /** Chamado antes da navegação nos links (ex.: `onOpenChange(false)` no modal). */
  onBeforeNavigate?: () => void;
}

/**
 * Estado vazio quando o caso não existe (404 em projeto-memória por ID).
 * Layout alinhado ao frame SoftFlow (ilustração + mensagem + CTA).
 */
export function CasoNaoEncontrado({
  casoId,
  className,
  onBeforeNavigate,
}: CasoNaoEncontradoProps) {
  const handleNav = () => {
    onBeforeNavigate?.();
  };

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
            Caso #{casoId} não encontrado
          </h1>
          <p className="text-lg leading-relaxed text-text-secondary max-w-[620px] mx-auto font-medium">
            Desculpe, mas o caso ou registro que você está tentando acessar não
            existe, foi excluído recentemente ou você não tem permissão para
            visualizá-lo.
          </p>
          {/* <p className="text-xs text-muted-foreground/90">
            Referência pesquisada:{" "}
            <span className="font-medium">#{casoId}</span>
          </p> */}
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild className="sm:min-w-[170px]">
            <Link href="/casos" onClick={handleNav}>
              <ArrowLeft className=" h-4 w-4" />
              Voltar para Listagem
            </Link>
          </Button>
          <Button
            asChild
            className="bg-brand-yellow text-primary hover:bg-brand-yellow/90 sm:min-w-[150px]"
          >
            <Link href="/casos/novo" onClick={handleNav}>
              <Plus className="h-4 w-4" />
              Adicionar caso
            </Link>
          </Button>
        </div>

        {/* <div className="mt-5 border-t border-border-divider pt-4">
          <p className="text-xs text-muted-foreground">
            Você também pode tentar acessar:
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-foreground/90">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <House className="h-3 w-3" />
              Dashboard Inicial
            </Link>
            <span className="inline-flex items-center gap-1">
              <Square className="h-2.5 w-2.5 fill-current" />
              <Link href="/casos" className="hover:underline">
                Meus Casos Atribuídos
              </Link>
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleHelp className="h-3 w-3" />
              <Link href="/casos" className="hover:underline">
                Suporte do Sistema
              </Link>
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
