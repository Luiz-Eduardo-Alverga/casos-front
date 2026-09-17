"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { cn } from "@/lib/utils";

export interface ProdutoNaoEncontradoProps {
  produtoId: string;
  className?: string;
}

export function ProdutoNaoEncontrado({
  produtoId,
  className,
}: ProdutoNaoEncontradoProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center px-6 pt-20 text-center",
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
            {PRODUTO_LABELS.naoEncontradoTitulo} #{produtoId}
          </h1>
          <p className="mx-auto max-w-[620px] text-lg font-medium leading-relaxed text-text-secondary">
            {PRODUTO_LABELS.naoEncontradoDescricao}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="sm:min-w-[170px]">
            <Link href="/produtos">
              <ArrowLeft className="h-4 w-4" />
              {PRODUTO_LABELS.voltarListagem}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
