"use client";

import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoPessoaChip } from "@/components/produtos/tabela/produto-pessoa-chip";
import {
  ProdutoStatusBadge,
  ProdutoVacaLeiteiraBadge,
} from "@/components/produtos/tabela/produto-status-badge";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { formatProdutoData } from "@/components/produtos/utils";
import { cn } from "@/lib/utils";

export interface ProdutoResumoValues {
  nome: string;
  registro: number;
  statusDesativado: boolean;
  vacaLeiteira: boolean;
  somenteLeitura: boolean;
  po: string;
  scrumMaster: string;
  setor: string;
  suporte: string;
  parametrizacao: string;
  bugs: string;
  melhorias: string;
  vinculadoA: string;
  dataCadastro: string;
}

export interface ProdutoResumoCardProps {
  values: ProdutoResumoValues;
  compact?: boolean;
}

function Identidade({ values }: { values: ProdutoResumoValues }) {
  return (
    <div className="min-w-0">
      <CardTitle className="text-base font-semibold tracking-tight text-text-primary">
        {values.nome}
      </CardTitle>
      <p className="mt-1 text-sm font-semibold tabular-nums text-muted-foreground">
        #{values.registro}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ProdutoStatusBadge desativado={values.statusDesativado} />
        {values.vacaLeiteira ? <ProdutoVacaLeiteiraBadge /> : null}
        {values.somenteLeitura ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
            <Lock className="h-3 w-3" />
            {PRODUTO_LABELS.somenteLeitura}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ResumoRow({
  label,
  children,
  first = false,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-2",
        !first && "border-t border-border-divider",
      )}
    >
      <span className="shrink-0 text-xs text-text-secondary">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

export function ProdutoResumoCard({
  values,
  compact = false,
}: ProdutoResumoCardProps) {
  if (compact) {
    return (
      <Card className="rounded-lg bg-card shadow-card lg:hidden">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <Identidade values={values} />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 p-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {PRODUTO_LABELS.setor}
            </div>
            <p className="mt-1 truncate text-sm text-text-primary">
              {values.setor || "—"}
            </p>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {PRODUTO_LABELS.productOwner}
            </div>
            <p className="mt-1 truncate text-sm text-text-primary">
              {values.po || "—"}
            </p>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {PRODUTO_LABELS.scrumMaster}
            </div>
            <p className="mt-1 truncate text-sm text-text-primary">
              {values.scrumMaster || "—"}
            </p>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {PRODUTO_LABELS.dataCadastro}
            </div>
            <p className="mt-1 truncate text-sm tabular-nums text-text-primary">
              {formatProdutoData(values.dataCadastro) || "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {PRODUTO_LABELS.resumo}
        </p>
        <Identidade values={values} />
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <ResumoRow label={PRODUTO_LABELS.productOwner} first>
          <ProdutoPessoaChip nome={values.po} />
        </ResumoRow>
        <ResumoRow label={PRODUTO_LABELS.scrumMaster}>
          <ProdutoPessoaChip nome={values.scrumMaster} />
        </ResumoRow>
        <ResumoRow label={PRODUTO_LABELS.setor}>
          <span className="block truncate text-sm text-text-primary">
            {values.setor || "—"}
          </span>
        </ResumoRow>
        <ResumoRow label="Resp. suporte">
          <span className="block truncate text-sm text-text-primary">
            {values.suporte || "—"}
          </span>
        </ResumoRow>
        <ResumoRow label="Resp. parametrização">
          <span className="block truncate text-sm text-text-primary">
            {values.parametrizacao || "—"}
          </span>
        </ResumoRow>
        <ResumoRow label="Resp. bugs">
          <ProdutoPessoaChip nome={values.bugs} />
        </ResumoRow>
        <ResumoRow label="Resp. melhorias">
          <ProdutoPessoaChip nome={values.melhorias} />
        </ResumoRow>
        <ResumoRow label={PRODUTO_LABELS.vinculadoA}>
          <span className="block truncate text-sm text-text-primary">
            {values.vinculadoA || "—"}
          </span>
        </ResumoRow>
        <ResumoRow label={PRODUTO_LABELS.dataCadastro}>
          <span className="text-sm tabular-nums text-text-primary">
            {formatProdutoData(values.dataCadastro) || "—"}
          </span>
        </ResumoRow>
      </CardContent>
    </Card>
  );
}
