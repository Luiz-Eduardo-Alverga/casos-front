"use client";

import type { ReactNode } from "react";
import { Loader2, Plus, RotateCw, Save, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import type { ComboboxOption } from "@/components/ui/combobox";
import { formatHorasResumoTotais } from "@/components/projetos/edicao/stakes/utils";
import { StakeLinha } from "@/components/projetos/edicao/stakes/stake-linha";
import type {
  StakeLinha as StakeLinhaValores,
  StakeLinhaErros,
  StakeLinhaStatus,
  StakesTotais,
} from "@/components/projetos/edicao/stakes/stakes-lista.types";

const TEXTO_AJUDA =
  "Horas por dia. Tab passa para o próximo campo, Enter na última linha cria outra, Ctrl+S salva e Ctrl+V com linhas copiadas abre a importação. Faixa azul: linha nova · faixa amarela: linha alterada.";

const TH_CLASS = "h-auto py-3 text-xs font-medium text-text-secondary";

export interface StakesListaProps {
  projetoId: number | string;
  nomeProjeto?: string;
  /** Linhas atuais (valores observados do formulário). */
  linhas: StakeLinhaValores[];
  /** Chave estável de cada linha do useFieldArray, na mesma ordem de `linhas`. */
  chaves: string[];
  status: StakeLinhaStatus[];
  erros: Map<string, StakeLinhaErros>;
  totais: StakesTotais;
  naoSalvas: number;
  tipoOptions: ComboboxOption[];
  colaboradorOptions: ComboboxOption[];
  isLoadingColaboradores?: boolean;
  canEdit: boolean;
  isSalvando: boolean;
  isError: boolean;
  errorMessage?: string;
  onTentarDeNovo: () => void;
  onAdicionar: () => void;
  onSalvar: () => void;
  onAlterou: (index: number) => void;
  onExcluir: (index: number) => void;
  /** Botões extras do header antes do divisor (Importar, Copiar linhas). */
  acoesExtras?: ReactNode;
}

export function StakesLista({
  projetoId,
  nomeProjeto,
  linhas,
  chaves,
  status,
  erros,
  totais,
  naoSalvas,
  tipoOptions,
  colaboradorOptions,
  isLoadingColaboradores,
  canEdit,
  isSalvando,
  isError,
  errorMessage,
  onTentarDeNovo,
  onAdicionar,
  onSalvar,
  onAlterou,
  onExcluir,
  acoesExtras,
}: StakesListaProps) {
  const pessoasLabel = totais.pessoas === 1 ? "1 pessoa" : `${totais.pessoas} pessoas`;

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Stakeholders
            </CardTitle>
            <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
              {pessoasLabel}
            </span>
            <span className="truncate text-xs text-text-secondary">
              #{projetoId}
              {nomeProjeto ? ` · ${nomeProjeto}` : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {naoSalvas > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-panel-badge-importance-yellow"
                />
                {naoSalvas === 1 ? "1 linha não salva" : `${naoSalvas} linhas não salvas`}
              </span>
            ) : null}
            {acoesExtras}
            {canEdit ? (
              <>
                {acoesExtras ? (
                  <span aria-hidden className="mx-1 hidden h-6 w-px bg-border-divider sm:block" />
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={onAdicionar}
                  disabled={isSalvando || isError}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar linha
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  onClick={onSalvar}
                  disabled={isSalvando || isError}
                >
                  {isSalvando ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {isSalvando ? "Salvando..." : "Salvar"}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-6 pt-2">
        {isError ? (
          <div className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-destructive">
              {errorMessage ?? "Erro ao carregar os stakeholders."}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onTentarDeNovo}>
              <RotateCw className="h-3.5 w-3.5" />
              Tentar de novo
            </Button>
          </div>
        ) : linhas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <EmptyState
              icon={Users}
              title="Nenhum stakeholder no projeto"
              description={
                canEdit
                  ? "Adicione uma linha para lançar a equipe do projeto."
                  : "Este projeto ainda não possui stakeholders cadastrados."
              }
              className="min-h-[160px]"
            />
            {canEdit ? (
              <Button type="button" size="sm" onClick={onAdicionar}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar linha
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {canEdit ? (
              <p className="text-xs text-text-secondary">{TEXTO_AJUDA}</p>
            ) : null}
            <div className="overflow-x-auto rounded-lg border border-border-divider">
              <Table className="min-w-[1080px]">
                <TableHeader>
                  <TableRow className="border-border-divider bg-background hover:bg-background">
                    <TableHead className={`${TH_CLASS} pl-4 pr-2`}>Função</TableHead>
                    <TableHead className={`${TH_CLASS} px-2`}>Colaborador</TableHead>
                    <TableHead className={`${TH_CLASS} px-2`}>Planejada</TableHead>
                    <TableHead className={`${TH_CLASS} px-2`}>Não planejada</TableHead>
                    <TableHead className={`${TH_CLASS} px-2`}>Dias</TableHead>
                    <TableHead className={`${TH_CLASS} px-2`}>Total</TableHead>
                    <TableHead className={`${TH_CLASS} px-2`}>Observação</TableHead>
                    <TableHead className={`${TH_CLASS} pl-1 pr-4 text-right`}>
                      <span className="sr-only">Excluir</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((linha, index) => (
                    <StakeLinha
                      key={chaves[index] ?? linha.key}
                      index={index}
                      linha={linha}
                      status={status[index] ?? "salva"}
                      erros={erros.get(linha.key)}
                      tipoOptions={tipoOptions}
                      colaboradorOptions={colaboradorOptions}
                      isLoadingColaboradores={isLoadingColaboradores}
                      canEdit={canEdit}
                      isLast={index === linhas.length - 1}
                      disabled={isSalvando}
                      onAlterou={onAlterou}
                      onExcluir={onExcluir}
                      onEnterUltima={onAdicionar}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {canEdit ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-8 px-0 text-text-primary"
                onClick={onAdicionar}
                disabled={isSalvando}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar linha
              </Button>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-4 py-2 text-sm">
              <span className="font-semibold text-text-primary">
                Totais · {pessoasLabel}
              </span>
              <div className="flex flex-wrap items-center gap-4 tabular-nums text-text-secondary">
                <span>
                  Planejada{" "}
                  <strong className="text-text-primary">
                    {formatHorasResumoTotais(totais.planejadasMin)}
                  </strong>
                </span>
                <span>
                  Não planejada{" "}
                  <strong className="text-text-primary">
                    {formatHorasResumoTotais(totais.naoPlanejadasMin)}
                  </strong>
                </span>
                <span>
                  Total{" "}
                  <strong className="text-text-primary">
                    {formatHorasResumoTotais(totais.totalMin)}
                  </strong>
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
