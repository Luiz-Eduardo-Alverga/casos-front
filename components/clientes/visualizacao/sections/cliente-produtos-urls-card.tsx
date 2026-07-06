"use client";

import { ExternalLink, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import {
  formatDataHoraAlteracao,
  toAbsoluteUrl,
} from "@/components/clientes/utils";
import type { ClienteDetalhe } from "@/services/clientes/get-cliente-by-id";

interface ClienteProdutosUrlsCardProps {
  cliente: ClienteDetalhe;
}

export function ClienteProdutosUrlsCard({
  cliente,
}: ClienteProdutosUrlsCardProps) {
  const produtos = cliente.produtos_enderecos_url ?? [];
  const preset = CARD_HEADER_PRESETS.clientes;

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Produtos / URLs de acesso"
        icon={preset.icon}
        iconClassName={preset.iconClassName}
      />
      <CardContent className="space-y-2 p-6 pt-2">
        {produtos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto vinculado"
            description="Este cliente ainda não possui URLs de produtos cadastradas."
            className="min-h-[160px]"
          />
        ) : (
          <div className="space-y-2">
            {produtos.map((produto) => {
              const urlAbsoluta = toAbsoluteUrl(produto.url);

              return (
                <div
                  key={produto.seq}
                  className="flex flex-col gap-3 rounded-lg border border-border-divider bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                      <Package className="h-4 w-4  text-indigo-500" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {produto.produto_nome}
                      </p>
                      <a
                        href={urlAbsoluta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-blue-500 items-center gap-1 break-all text-xs font-medium hover:underline"
                      >
                        {produto.url}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="shrink-0 text-right  sm:max-w-[240px]">
                    <p className="font-medium uppercase text-xs text-text-secondary">
                      Última alteração
                    </p>
                    <p className="font-semibold text-text-primary text-sm">
                      {produto.alteracao_usuario
                        ? `por ${produto.alteracao_usuario} ${formatDataHoraAlteracao(produto.alteracao_datahora)}`
                        : "—"}
                    </p>
                    <p></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
