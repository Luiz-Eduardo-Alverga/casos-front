"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, MailOpen } from "lucide-react";
import { useMensagens } from "@/hooks/use-mensagens";
import { useRouter } from "next/navigation";
import type { Mensagem } from "@/services/mensagens/get-mensagens";
import { cn } from "@/lib/utils";

const LIMITE_MODAL = 10;

function formatarData(value: string | null): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

interface AvisosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvisosModal({ open, onOpenChange }: AvisosModalProps) {
  const router = useRouter();
  const { data, isLoading } = useMensagens(undefined, { enabled: open });

  const mensagens = data?.data ?? [];
  const exibir = mensagens.slice(0, LIMITE_MODAL);

  const handleVerTodos = () => {
    onOpenChange(false);
    router.push("/avisos");
  };

  const handleClickAviso = (id: number | string) => {
    onOpenChange(false);
    router.push(`/avisos?id=${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5" />
            Avisos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border-divider p-3 flex flex-col gap-2"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : exibir.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nenhum aviso"
              description="Não há avisos no momento."
              className="min-h-[160px]"
            />
          ) : (
            <div className="space-y-2">
              {exibir.map((m: Mensagem) => {
                const lido = m.status_leitura?.lido ?? false;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleClickAviso(m.id)}
                    className={cn(
                      "w-full text-left rounded-lg border border-border-divider p-3 transition-colors hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {lido ? (
                        <MailOpen className="h-4 w-4 shrink-0 text-text-secondary mt-0.5" />
                      ) : (
                        <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm truncate",
                            lido
                              ? "text-text-secondary font-normal"
                              : "text-text-primary font-semibold"
                          )}
                        >
                          {m.titulo || "Sem título"}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatarData(
                            m.datas?.enviado ?? m.datas?.msg ?? null
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex shrink-0 pt-2 border-t border-border-divider">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleVerTodos}
          >
            Ver todos os avisos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
