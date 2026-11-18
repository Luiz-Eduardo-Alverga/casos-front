"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { UsuarioComunicado } from "@/services/comunicados/types";
import { buscarUsuarios, descricaoUsuario, iniciais } from "./utils";

interface AdicionarUsuarioProps {
  /** Empresa inteira (decisão #6: ignora os filtros). */
  usuarios: UsuarioComunicado[];
  /** Registros que já estão na lista (não aparecem como sugestão). */
  jaNaLista: number[];
  onAdicionar: (usuario: UsuarioComunicado) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AdicionarUsuario({
  usuarios,
  jaNaLista,
  onAdicionar,
  isLoading,
  disabled,
}: AdicionarUsuarioProps) {
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);

  const sugestoes = useMemo(() => {
    const presentes = new Set(jaNaLista);
    return buscarUsuarios(
      usuarios.filter((u) => !presentes.has(u.registro)),
      busca,
    );
  }, [usuarios, jaNaLista, busca]);

  const escolher = (u: UsuarioComunicado) => {
    onAdicionar(u);
    setBusca("");
    setOpen(false);
  };

  return (
    <div className="shrink-0 space-y-2">
      <Label htmlFor="aviso-adicionar-usuario" className="text-text-label">
        Adicionar usuário específico
      </Label>
      <Popover open={open && busca.trim() !== ""} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              id="aviso-adicionar-usuario"
              value={busca}
              disabled={disabled}
              autoComplete="off"
              placeholder={
                isLoading
                  ? "Carregando usuários..."
                  : "Buscar por nome ou registro, sem usar filtros..."
              }
              className="bg-card pl-9"
              onChange={(e) => {
                setBusca(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && sugestoes[0]) {
                  e.preventDefault();
                  escolher(sugestoes[0]);
                }
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] min-w-[260px] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {isLoading
                  ? "Carregando usuários..."
                  : "Nenhum usuário encontrado."}
              </CommandEmpty>
              <CommandGroup>
                {sugestoes.map((u) => (
                  <CommandItem
                    key={u.registro}
                    value={String(u.registro)}
                    onSelect={() => escolher(u)}
                    className="gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel-badge-open-bg text-xs font-semibold text-panel-badge-open">
                      {iniciais(u.nome_suporte)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text-primary">
                        {u.nome_suporte}
                      </span>
                      <span className="block truncate text-xs text-text-secondary">
                        {descricaoUsuario(u)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-text-secondary">
                      #{u.registro}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
