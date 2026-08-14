"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  AnotacaoCasoItem,
  ClienteCasoItem,
} from "@/interfaces/projeto-memoria";
import {
  getClienteIdsVinculados,
  getClientesVinculadosUnicos,
} from "./abrir-ocorrencia-utils";
import { useAbrirOcorrencia } from "./use-abrir-ocorrencia";

export interface AbrirOcorrenciaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casoId: number;
  clientes?: ClienteCasoItem[] | null;
  descricaoResumo?: string | null;
  anotacoes?: AnotacaoCasoItem[] | null;
  ultimaAnotacaoTexto?: string | null;
  responsavelFeedbackNome?: string | null;
}

function labelCliente(item: ClienteCasoItem): string {
  const nome = (item.cliente_nome ?? "").trim();
  return nome || `Cliente #${item.cliente}`;
}

export function AbrirOcorrenciaModal({
  open,
  onOpenChange,
  casoId,
  clientes,
  descricaoResumo,
  anotacoes,
  ultimaAnotacaoTexto,
  responsavelFeedbackNome,
}: AbrirOcorrenciaModalProps) {
  const { abrir, isPending } = useAbrirOcorrencia({
    casoId,
    clientes,
    descricaoResumo,
    anotacoes,
    ultimaAnotacaoTexto,
    responsavelFeedbackNome,
  });
  const clientesUnicos = useMemo(
    () => getClientesVinculadosUnicos(clientes),
    [clientes],
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(getClienteIdsVinculados(clientes)));
  }, [open, clientes]);

  const hasClientes = clientesUnicos.length > 0;
  const selectedCount = selectedIds.size;
  const canSubmit = hasClientes && selectedCount > 0 && !isPending;

  const toggleCliente = (clienteId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(clienteId);
      else next.delete(clienteId);
      return next;
    });
  };

  const handleClose = (nextOpen: boolean) => {
    if (isPending) return;
    onOpenChange(nextOpen);
  };

  const handleConfirmar = async () => {
    if (!canSubmit) return;
    const shouldClose = await abrir([...selectedIds]);
    if (shouldClose) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Abrir ocorrência para o suporte?
      </DialogTitle>
      <DialogContent
        className="max-h-[90vh] w-[min(96vw,560px)] max-w-[560px] min-w-0 gap-0 overflow-y-auto overflow-x-hidden border-border-divider p-0 sm:rounded-2xl"
        onPointerDownOutside={(e) => {
          if (isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault();
        }}
      >
        <div className="min-w-0 bg-card p-6">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
              <Ticket className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-text-primary">
                Abrir ocorrência para o suporte?
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {hasClientes
                  ? "O caso foi marcado como incompleto. Escolha os clientes para os quais deseja abrir ocorrência."
                  : "É necessário ter pelo menos 1 cliente vinculado ao caso para abrir uma ocorrência."}
              </p>
            </div>
          </div>

          {hasClientes ? (
            <ul className="mt-5 max-h-[280px] space-y-1 overflow-y-auto rounded-md border border-border-divider p-2">
              {clientesUnicos.map((item) => {
                const id = Number(item.cliente);
                const checked = selectedIds.has(id);
                return (
                  <li key={id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2",
                        "hover:bg-muted/60",
                        isPending && "cursor-not-allowed opacity-70",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleCliente(id, value === true)
                        }
                        disabled={isPending}
                        aria-label={labelCliente(item)}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                        {labelCliente(item)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="mt-2 flex items-center justify-end gap-3 pt-5">
            {hasClientes ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={isPending}
                  className="flex-1"
                >
                  Agora não
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleConfirmar()}
                  disabled={!canSubmit}
                  className="flex-1 px-5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Abrindo...
                    </>
                  ) : (
                    "Abrir ocorrência"
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
