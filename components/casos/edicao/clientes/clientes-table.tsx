"use client";

import { useState } from "react";
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
import { Check, Copy, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ClientesTableSkeleton } from "./clientes-table-skeleton";

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copiada!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar URL");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 shrink-0 px-2"
      onClick={handleCopy}
      aria-label={copied ? "URL copiada" : "Copiar URL"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
        </>
      )}
    </Button>
  );
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
    return <span className="text-sm text-blue-500">—</span>;
  }

  const urls = urlText
    .split(", ")
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length === 1) {
    const href = toAbsoluteUrl(urls[0]);
    return (
      <div className="flex items-center gap-2 max-w-[360px]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={urls[0]}
          className="text-sm text-blue-500 hover:underline block min-w-0 flex-1 truncate"
        >
          {urls[0]}
        </a>
        <CopyUrlButton url={urls[0]} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 max-w-[360px]">
      {urls.map((url) => (
        <div key={url} className="flex items-center gap-2 min-w-0">
          <a
            href={toAbsoluteUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            title={url}
            className="text-sm text-primary hover:underline truncate block min-w-0 flex-1"
          >
            {url}
          </a>
          <CopyUrlButton url={url} />
        </div>
      ))}
    </div>
  );
}

export interface ClientesTableProps {
  clientes: ClienteCasoItem[];
  urlPorCliente: Map<number, string>;
  isLoadingUrls?: boolean;
  canDelete?: boolean;
  onAskDelete: (sequencia: number) => void;
}

export function ClientesTable({
  clientes,
  urlPorCliente,
  isLoadingUrls,
  canDelete = true,
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
        <TableRow className="bg-table-row-bg border-b border-border hover:bg-table-row-hover">
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
            className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover"
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
              <UrlCell clienteId={item.cliente} urlPorCliente={urlPorCliente} />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  onClick={() => onAskDelete(item.sequencia)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
