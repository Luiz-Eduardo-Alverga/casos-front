"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";
import { Trash2 } from "lucide-react";
import { ClientesTableSkeleton } from "./clientes-table-skeleton";

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export interface ClientesTableProps {
  clientes: ClienteCasoItem[];
  urlPorCliente: Map<number, string>;
  isLoadingUrls?: boolean;
  onAskDelete: (sequencia: number) => void;
}

function UrlCell({
  clienteId,
  urlPorCliente,
}: {
  clienteId: number;
  urlPorCliente: Map<number, string>;
}) {
  const urlText = urlPorCliente.get(clienteId);
  if (!urlText) {
    return <span className="text-sm text-text-secondary">—</span>;
  }

  const urls = urlText
    .split(", ")
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length === 1) {
    const href = toAbsoluteUrl(urls[0]);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={urls[0]}
        className="text-sm text-blue-500 hover:underline  block max-w-[240px]"
      >
        {urls[0]}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 max-w-[240px]">
      {urls.map((url) => (
        <a
          key={url}
          href={toAbsoluteUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          title={url}
          className="text-sm text-primary hover:underline truncate block"
        >
          {url}
        </a>
      ))}
    </div>
  );
}

export function ClientesTable({
  clientes,
  urlPorCliente,
  isLoadingUrls,
  onAskDelete,
}: ClientesTableProps) {
  const lista = Array.isArray(clientes) ? clientes : [];

  if (lista.length === 0) {
    return (
      <EmptyState
        imageAlt="Nenhum cliente vinculado"
        imageSrc="/images/empty-state-casos-produto.svg"
        title="Nenhum cliente vinculado"
        description="Adicione um cliente acima."
      />
    );
  }

  if (isLoadingUrls) {
    return <ClientesTableSkeleton rowCount={lista.length} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Cliente
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Nome
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Data solicitação
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            URL
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[80px]">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lista.map((item) => (
          <TableRow
            key={item.sequencia}
            className="bg-white border-t border-border-divider hover:bg-white"
          >
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-primary">{item.cliente}</span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-primary">
                {item.cliente_nome ?? "—"}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-secondary">
                {item.data_solicitacao}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <UrlCell
                clienteId={item.cliente}
                urlPorCliente={urlPorCliente}
              />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:text-destructive"
                onClick={() => onAskDelete(item.sequencia)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
