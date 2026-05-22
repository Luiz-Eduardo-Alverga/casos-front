"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SgpUsuarioProjetoItem } from "@/interfaces/sgp-usuario-projeto";
import {
  getUsuarioIniciais,
  getUsuarioNomeExibicao,
} from "@/components/projetos/edicao/stakes/utils";

export interface UsuarioAutorizadoCardProps {
  usuario: SgpUsuarioProjetoItem;
  onExcluir?: (usuario: SgpUsuarioProjetoItem) => void;
}

export function UsuarioAutorizadoCard({
  usuario,
  onExcluir,
}: UsuarioAutorizadoCardProps) {
  const nome = getUsuarioNomeExibicao(usuario.nome, usuario.usuario);
  const iniciais = getUsuarioIniciais(usuario.nome, usuario.usuario);

  return (
    <article className="flex items-center gap-4 rounded-lg border border-border-divider bg-background p-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-text-primary"
        aria-hidden
      >
        {iniciais}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-text-primary">
          {nome}
        </h3>
        <p className="truncate text-sm text-text-secondary">
          {usuario.setor?.trim() || "Setor não informado"}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
        onClick={() => onExcluir?.(usuario)}
        disabled={!onExcluir}
        aria-label={`Remover ${nome}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </article>
  );
}
