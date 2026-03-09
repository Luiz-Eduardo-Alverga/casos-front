"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, MailOpen } from "lucide-react";
import { useMensagens } from "@/hooks/use-mensagens";
import { useRouter } from "next/navigation";
import type { Mensagem } from "@/services/mensagens/get-mensagens";
import { getPeriodoRange } from "@/lib/periodo-avisos";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const LIMITE_DROPDOWN = 10;

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

export function AvisosDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const periodoMesAtual = useMemo(
    () => getPeriodoRange("este_mes"),
    []
  );

  const { data, isLoading } = useMensagens(
    {
      data_msg_inicio: periodoMesAtual.data_msg_inicio,
      data_msg_fim: periodoMesAtual.data_msg_fim,
    },
    { enabled: open }
  );

  const mensagens = data?.data ?? [];
  const exibir = mensagens.slice(0, LIMITE_DROPDOWN);

  const handleVerTodos = () => {
    setOpen(false);
    router.push("/avisos");
  };

  const handleClickAviso = (id: number | string) => {
    setOpen(false);
    router.push(`/avisos?id=${id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-muted relative"
          aria-label="Abrir avisos"
        >
          <Bell className="h-[18px] w-[15.75px] text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-h-[85vh] flex flex-col p-0"
      >
        <div className="p-4 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Avisos</h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Período: este mês
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 max-h-[60vh]">
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
              description="Não há avisos no mês atual."
              className="min-h-[140px]"
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

        <div className="p-4 pt-2 border-t border-border-divider shrink-0">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleVerTodos}
          >
            Ver todos os avisos
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
