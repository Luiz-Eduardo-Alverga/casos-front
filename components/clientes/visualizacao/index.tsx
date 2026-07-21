"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useClienteById } from "@/hooks/catalogos/use-cliente-by-id";
import { isHttpError } from "@/lib/http-error";
import { ClienteViewHeader } from "./cliente-view-header";
import { ClienteViewSkeleton } from "./cliente-view-skeleton";
import { ClienteNaoEncontrado } from "./cliente-nao-encontrado";
import { ClienteDadosGeraisCard } from "./sections/cliente-dados-gerais-card";
import { ClienteContatoCard } from "./sections/cliente-contato-card";
import { ClienteEnderecoCard } from "./sections/cliente-endereco-card";
import { ClienteProdutosUrlsCard } from "./sections/cliente-produtos-urls-card";
import { ClienteCasosTab } from "./sections/cliente-casos-tab";
import { ClienteTicketsTab } from "./sections/cliente-tickets-tab";

interface ClienteViewProps {
  clienteId: string;
}

export function ClienteView({ clienteId }: ClienteViewProps) {
  const { data, isLoading, isError, error } = useClienteById(clienteId);
  const cliente = data?.data;

  if (isLoading) {
    return <ClienteViewSkeleton />;
  }

  if (isError && isHttpError(error) && error.status === 404) {
    return <ClienteNaoEncontrado clienteId={clienteId} />;
  }

  if (isError || !cliente) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="max-w-md text-sm text-text-secondary">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do cliente."}
        </p>
        <Button asChild variant="outline">
          <Link href="/clientes">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Voltar para Listagem
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="dados"
      className="flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden"
    >
      <ClienteViewHeader />

      <div className="mt-3 min-h-0 flex-1 overflow-auto pb-12">
        <TabsContent value="dados" className="mt-0">
          <div className="flex min-w-0 flex-col gap-2">
            <ClienteDadosGeraisCard cliente={cliente} />
            <ClienteContatoCard cliente={cliente} />
            <ClienteEnderecoCard cliente={cliente} />
            <ClienteProdutosUrlsCard cliente={cliente} />
          </div>
        </TabsContent>

        <TabsContent value="casos" className="mt-0">
          <ClienteCasosTab clienteId={cliente.registro} />
        </TabsContent>

        <TabsContent value="tickets" className="mt-0">
          <ClienteTicketsTab
            registro={cliente.registro}
            clienteNome={cliente.nome}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
