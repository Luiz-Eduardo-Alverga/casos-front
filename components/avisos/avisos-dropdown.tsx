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

  const periodoMesAtual = useMemo(() => getPeriodoRange("este_mes"), []);

  const { data, isLoading } = useMensagens(
    {
      data_msg_inicio: periodoMesAtual.data_msg_inicio,
      data_msg_fim: periodoMesAtual.data_msg_fim,
    },
    { enabled: open },
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
          className="h-9 w-9 hover:bg-muted relative "
          aria-label="Abrir avisos"
        >
          <Bell className="h-[18px] w-[15.75px] text-foreground sr-only lg:not-sr-only" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-h-[55vh] flex flex-col p-0"
      >
        <div className="p-4 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-text-primary" />
              <h3 className="text-sm leading-5 font-semibold text-text-primary">
                Avisos do mês atual
              </h3>
            </div>

            <Button
              variant="link"
              size="sm"
              onClick={handleVerTodos}
              className="text-xs leading-4 text-text-secondary underline mb-0.5"
            >
              Ver todos os avisos
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 pt-3 max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border-divider p-3 flex items-center gap-3"
                >
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 py-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
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
            <div className="flex flex-col gap-2">
              {exibir.map((m: Mensagem) => {
                const lido = m.status_leitura?.lido ?? false;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleClickAviso(m.id)}
                    className={cn(
                      "w-full text-left rounded-lg border border-border-divider p-2 flex items-center gap-3 transition-colors hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 size-8 rounded-full flex items-center justify-center border",
                        lido
                          ? "bg-muted border-border-divider"
                          : "bg-border-accent border-border-accent",
                      )}
                    >
                      {lido ? (
                        <MailOpen className="h-3.5 w-3.5 text-text-secondary" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1.5">
                      <p
                        className={cn(
                          "text-sm truncate",
                          lido
                            ? "text-text-secondary font-normal"
                            : "text-text-primary font-semibold",
                        )}
                      >
                        {m.titulo || "Sem título"}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatarData(m.datas?.enviado ?? m.datas?.msg ?? null)}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Enviado por {m.enviado_por}
                      </p>
                    </div>
                    {!lido && (
                      <span
                        className="shrink-0 size-2 rounded-full bg-primary ml-2"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
