"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/painel/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Mail, MailOpen, User } from "lucide-react";
import { useMensagens } from "@/hooks/use-mensagens";
import type { Mensagem } from "@/services/mensagens/get-mensagens";
import { AvisosListaSkeleton } from "./avisos-lista-skeleton";
import { cn } from "@/lib/utils";

export interface PeriodoParams {
  data_msg_inicio?: string;
  data_msg_fim?: string;
}

interface AvisosListaProps {
  idSelecionado: number | string | null;
  onSelect: (id: number | string) => void;
  periodo?: PeriodoParams;
}

const MESES_PT: Record<number, string> = {
  0: "Janeiro",
  1: "Fevereiro",
  2: "Março",
  3: "Abril",
  4: "Maio",
  5: "Junho",
  6: "Julho",
  7: "Agosto",
  8: "Setembro",
  9: "Outubro",
  10: "Novembro",
  11: "Dezembro",
};

/** Data curta no estilo "16/03 15h" */
function formatarDataCurta(value: string | null): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const h = date.getHours();
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")} ${h}h`;
  } catch {
    return value;
  }
}

/** Data longa só dia/mês/ano: "Enviado 08 de Janeiro de 2025" */
function formatarDataEnviado(value: string | null): string {
  if (!value) return "Enviado —";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Enviado —";
    const dia = date.getDate();
    const mes = MESES_PT[date.getMonth()] ?? "";
    const ano = date.getFullYear();
    return `Enviado ${dia} de ${mes} de ${ano}`;
  } catch {
    return "Enviado —";
  }
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase() || "?";
}

function ItemAviso({
  mensagem,
  selecionado,
  onClick,
}: {
  mensagem: Mensagem;
  selecionado: boolean;
  onClick: () => void;
}) {
  const lido = mensagem.status_leitura?.lido ?? false;
  const dataValor = mensagem.datas?.enviado ?? mensagem.datas?.msg ?? null;
  const dataCurta = formatarDataCurta(dataValor);
  const dataEnviado = formatarDataEnviado(dataValor);
  const enviadoPor = mensagem.enviado_por || "—";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border bg-white shadow-sm transition-colors hover:bg-muted/50",
        "p-4 flex flex-col gap-0",
        selecionado
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border-divider",
      )}
    >
      {/* Top: Avatar + bloco de texto (título, data curta, enviado por) */}
      <div className="flex gap-3 items-start">
        <Avatar className="h-10 w-10 shrink-0 rounded-full bg-blue-100 border-0">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
            {enviadoPor !== "—" ? iniciais(enviadoPor) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-bold leading-5  line-clamp-2",
              lido && "font-medium text-text-secondary",
            )}
          >
            {mensagem.titulo || "Sem título"}
          </p>

          <p className="text-xs font-normal text-text-secondary mt-1">
            Enviado por {enviadoPor}
          </p>
        </div>
      </div>
      {/* Bottom: data longa com espaçamento */}
      <p className="text-xs font-normal text-text-secondary mt-3">
        {dataEnviado}
      </p>
    </button>
  );
}

export function AvisosLista({
  idSelecionado,
  onSelect,
  periodo,
}: AvisosListaProps) {
  const paramsNaoLidos = {
    lido: false,
    data_msg_inicio: periodo?.data_msg_inicio,
    data_msg_fim: periodo?.data_msg_fim,
  };
  const paramsLidos = {
    lido: true,
    data_msg_inicio: periodo?.data_msg_inicio,
    data_msg_fim: periodo?.data_msg_fim,
  };
  const { data: dataNaoLidos, isLoading: loadingNaoLidos } =
    useMensagens(paramsNaoLidos);
  const { data: dataLidos, isLoading: loadingLidos } =
    useMensagens(paramsLidos);

  const naoLidos = dataNaoLidos?.data ?? [];
  const lidos = dataLidos?.data ?? [];
  const isLoading = loadingNaoLidos || loadingLidos;

  if (isLoading) {
    return <AvisosListaSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Avisos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <Tabs defaultValue="nao-lidos" className="flex flex-col h-full">
          <TabsList className="w-full grid grid-cols-2 shrink-0 mb-4">
            <TabsTrigger value="nao-lidos">
              Não lidos ({naoLidos.length})
            </TabsTrigger>
            <TabsTrigger value="lidos">Lidos ({lidos.length})</TabsTrigger>
          </TabsList>
          <TabsContent
            value="nao-lidos"
            className="flex-1 mt-0 min-h-0 overflow-y-auto"
          >
            {naoLidos.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="Nenhum aviso não lido"
                description="Não há avisos pendentes de leitura."
              />
            ) : (
              <div className="flex flex-col gap-4">
                {naoLidos.map((m) => (
                  <ItemAviso
                    key={m.id}
                    mensagem={m}
                    selecionado={String(m.id) === String(idSelecionado)}
                    onClick={() => onSelect(m.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="lidos"
            className="flex-1 mt-0 min-h-0 overflow-y-auto"
          >
            {lidos.length === 0 ? (
              <EmptyState
                icon={MailOpen}
                title="Nenhum aviso lido"
                description="Avisos que você ler aparecerão aqui."
              />
            ) : (
              <div className="flex flex-col gap-4">
                {lidos.map((m) => (
                  <ItemAviso
                    key={m.id}
                    mensagem={m}
                    selecionado={String(m.id) === String(idSelecionado)}
                    onClick={() => onSelect(m.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
