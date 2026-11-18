"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/painel/empty-state";
import { Bell, FileText, Check, User } from "lucide-react";
import { useMarcarMensagemComoLida } from "@/hooks/mensagens/use-marcar-mensagem-lida";
import { useMensagens } from "@/hooks/mensagens/use-mensagens";
import { AvisosDetalheSkeleton } from "./avisos-detalhe-skeleton";
import { AvisoLinkConfirmacao } from "./aviso-link-confirmacao";
import { formatarDataLonga, iniciaisRemetente as iniciais } from "@/lib/mensagens/formatar";

interface AvisosDetalheProps {
  idSelecionado: number | string | null;
}

export function AvisosDetalhe({ idSelecionado }: AvisosDetalheProps) {
  const marcarComoLida = useMarcarMensagemComoLida();
  const { data, isLoading } = useMensagens(
    idSelecionado != null ? { id: idSelecionado } : undefined,
    { enabled: idSelecionado != null },
  );

  const mensagem = data?.data?.[0] ?? null;

  if (idSelecionado != null && isLoading) {
    return <AvisosDetalheSkeleton />;
  }

  if (!mensagem) {
    return (
      <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Detalhes do aviso
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto flex items-center justify-center">
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            className="mt-16"
            title="Selecione um aviso"
            description="Clique em um aviso na lista para visualizar o conteúdo."
          />
        </CardContent>
      </Card>
    );
  }

  const lido = mensagem.status_leitura?.lido ?? false;
  const dataEnviado = formatarDataLonga(
    mensagem.datas?.enviado ?? mensagem.datas?.hora ?? null,
  );
  const enviadoPor = mensagem.enviado_por || "—";

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Detalhes do aviso
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto space-y-4">
        {/* Remetente: Avatar + "Enviado por" + data + Badge Lido ou botão Marcar como lido */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0 rounded-full bg-blue-100 border-0">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
              {enviadoPor !== "—" ? iniciais(enviadoPor) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">
              Enviado por {enviadoPor}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{dataEnviado}</p>
          </div>
          {lido ? (
            <Badge
              className="shrink-0 rounded-full bg-green-100 text-green-800 border-0 font-medium"
              variant="secondary"
            >
              Lido
            </Badge>
          ) : (
            <Button
              size="sm"
              className="shrink-0 h-8"
              onClick={() => marcarComoLida.mutate(mensagem.id)}
              disabled={marcarComoLida.isPending}
            >
              {marcarComoLida.isPending ? (
                "Salvando..."
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Marcar como lido
                </>
              )}
            </Button>
          )}
        </div>

        {/* Assunto */}
        {mensagem.titulo && (
          <h3 className="text-sm font-bold text-text-primary">
            {mensagem.titulo}
          </h3>
        )}

        {/* Corpo da mensagem */}
        <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed space-y-2">
          {mensagem.msg_texto || "Sem conteúdo."}
        </div>

        <AvisoLinkConfirmacao link={mensagem.link} />
      </CardContent>
    </Card>
  );
}
