"use client";

import { ClientesTable } from "@/components/casos/edicao/clientes/clientes-table";
import type { VincularClienteListProps } from "./types";

export function VincularClienteList({
  clientes,
  urlPorCliente,
  isLoadingUrls,
  onAskDelete,
}: VincularClienteListProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border-divider bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Clientes Vinculados
        </h3>
        <p className="text-xs text-text-secondary">
          {clientes.length}{" "}
          {clientes.length === 1 ? "registro" : "registros"}
        </p>
      </header>

      <div className="max-h-[280px] overflow-y-auto p-2">
        <ClientesTable
          clientes={clientes}
          urlPorCliente={urlPorCliente}
          isLoadingUrls={isLoadingUrls}
          onAskDelete={onAskDelete}
        />
      </div>
    </section>
  );
}
