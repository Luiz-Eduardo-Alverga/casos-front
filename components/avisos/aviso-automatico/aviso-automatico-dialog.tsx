"use client";

import { useRef } from "react";
import { Bell, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatarDataLonga, iniciaisRemetente } from "@/lib/mensagens/formatar";
import type { Mensagem } from "@/services/mensagens/get-mensagens";
import { AvisoLinkConfirmacao } from "../aviso-link-confirmacao";

interface AvisoAutomaticoDialogProps {
  mensagem: Mensagem;
  /** Quantos avisos ainda vêm depois deste. */
  restantes: number;
  marcando: boolean;
  erro: boolean;
  onMarcarComoLido: () => void;
}

const bloquear = (e: Event) => e.preventDefault();

/**
 * Janela bloqueante (decisão #19): sem X, Esc e clique fora não fecham. Fica acima de qualquer
 * outro modal e do mini-player do caso (decisão #24). No mobile vira folha presa embaixo.
 */
export function AvisoAutomaticoDialog({
  mensagem,
  restantes,
  marcando,
  erro,
  onMarcarComoLido,
}: AvisoAutomaticoDialogProps) {
  const botaoRef = useRef<HTMLButtonElement>(null);
  const remetente = mensagem.enviado_por || "—";
  const ultimo = restantes === 0;

  return (
    <Dialog open modal>
      <DialogContent
        role="alertdialog"
        showCloseButton={false}
        overlayClassName="z-[80]"
        onEscapeKeyDown={bloquear}
        onPointerDownOutside={bloquear}
        onInteractOutside={bloquear}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          botaoRef.current?.focus();
        }}
        className="z-[80] flex max-h-[88vh] max-w-[640px] flex-col gap-0 overflow-hidden rounded-lg border-border-input bg-card p-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-lg max-sm:data-[state=open]:slide-in-from-left-0 max-sm:data-[state=open]:slide-in-from-bottom-full max-sm:data-[state=open]:zoom-in-100"
      >
        <div className="shrink-0 space-y-4 border-b border-border-divider p-6 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-panel-badge-open-bg px-2 py-0.5 text-xs font-semibold text-panel-badge-open">
              <Bell className="h-3.5 w-3.5" />
              Aviso importante
            </span>
            {!ultimo ? (
              <span className="text-xs text-text-secondary">
                {restantes === 1
                  ? "Mais 1 aviso depois deste"
                  : `Mais ${restantes} avisos depois deste`}
              </span>
            ) : null}
          </div>
          <DialogTitle className="text-lg font-bold leading-snug text-text-primary">
            {mensagem.titulo}
          </DialogTitle>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-badge-open-bg text-xs font-semibold text-panel-badge-open">
              {remetente !== "—" ? iniciaisRemetente(remetente) : "?"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                Enviado por {remetente}
              </p>
              <DialogDescription className="text-xs text-text-secondary">
                {formatarDataLonga(
                  mensagem.datas?.enviado ?? mensagem.datas?.hora ?? null,
                )}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-6">
          <p className="whitespace-pre-wrap text-sm text-text-primary">
            {mensagem.msg_texto || "Sem conteúdo."}
          </p>
          <AvisoLinkConfirmacao link={mensagem.link} />
        </div>

        {erro ? (
          <p className="shrink-0 px-6 pb-2 text-xs text-text-error" role="alert">
            Não foi possível marcar como lido. Tente de novo.
          </p>
        ) : null}

        <div className="flex shrink-0 flex-col gap-4 border-t border-border-divider px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs text-text-secondary">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Este aviso continua aparecendo até ser marcado como lido.
          </p>
          <Button
            ref={botaoRef}
            type="button"
            onClick={onMarcarComoLido}
            disabled={marcando}
            className="shrink-0 max-sm:w-full"
          >
            <Check className="size-4" />
            {marcando
              ? "Marcando..."
              : ultimo
                ? "Marcar como lido"
                : "Marcar como lido e ver o próximo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
