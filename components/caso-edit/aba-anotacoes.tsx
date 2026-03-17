"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { AnotacaoCasoItem } from "@/interfaces/projeto-memoria";
import { Pencil, Trash2, FileText, User } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { cn } from "@/lib/utils";

const PLACEHOLDER_DESCRICAO_COMPLETA =
  "Descreva detalhadamente o caso, incluindo contexto, passos para reproduzir e comportamento esperado...";

/** Exibe data no formato "Criado em ..." */
function formatarCriadoEm(dataAnotacao: string) {
  if (!dataAnotacao?.trim()) return "";
  const s = dataAnotacao.trim();
  if (/^criado em/i.test(s)) return s;
  return `Criado em ${s}`;
}

export interface AbaAnotacoesProps {
  casoId: number;
  anotacoes: AnotacaoCasoItem[];
  onCreate: (payload: { registro: number; anotacoes: string }) => Promise<void>;
  onUpdate: (payload: {
    id: number;
    data: { anotacoes: string };
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isCreating?: boolean;
}

/**
 * Aba Anotações do caso.
 * Estrutura: Card com header (título + badge #caso), seção Descrição Completa (nova anotação) e lista de anotações com scroll interno.
 * Segue PADRAO_COMPONENTES e PADRAO_ESPACAMENTOS.
 */
export function AbaAnotacoes({
  casoId,
  anotacoes,
  onCreate,
  onUpdate,
  onDelete,
  isCreating = false,
}: AbaAnotacoesProps) {
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoTexto, setEditandoTexto] = useState("");
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({ open: false, sequencia: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const lista = Array.isArray(anotacoes) ? anotacoes : [];

  const handleAdicionar = async () => {
    const texto = novaAnotacao.trim();
    if (!texto) return;
    await onCreate({ registro: casoId, anotacoes: texto });
    setNovaAnotacao("");
  };

  const handleIniciarEdicao = (item: AnotacaoCasoItem) => {
    setEditandoId(item.sequencia);
    setEditandoTexto(item.anotacoes);
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setEditandoTexto("");
  };

  const handleSalvarEdicao = async () => {
    if (editandoId == null) return;
    await onUpdate({ id: editandoId, data: { anotacoes: editandoTexto } });
    setEditandoId(null);
    setEditandoTexto("");
  };

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    setIsDeleting(true);
    try {
      await onDelete(excluirModal.sequencia);
      setExcluirModal({ open: false, sequencia: 0 });
    } finally {
      setIsDeleting(false);
    }
  };

  /** Altura mínima do bloco de texto da anotação; expande com o conteúdo */
  const ALTURA_MIN_ANOTACAO = "min-h-[144px]";

  return (
    <>
      <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
        <CasoEditCardHeader
          title="Anotações do caso"
          icon={FileText}
          badge={casoId}
        />

        <CardContent className="p-6 pt-3 flex flex-col lg:flex-1 ">
          {/* Nova anotação: Descrição Completa + textarea + Salvar */}
          <div className="shrink-0 flex flex-col items-end gap-3 border-b border-border-divider pb-4 space-y-2">
            <div className="w-full space-y-2">
              <Label
                htmlFor="nova-anotacao"
                className="text-sm font-medium text-text-label"
              >
                Descrição Completa
              </Label>
              <Textarea
                id="nova-anotacao"
                placeholder={PLACEHOLDER_DESCRICAO_COMPLETA}
                value={novaAnotacao}
                onChange={(e) => setNovaAnotacao(e.target.value)}
                className="min-h-[158px] w-full resize-none rounded-lg border-border-input px-4 py-3"
                disabled={isCreating}
              />
            </div>
            <Button
              type="button"
              onClick={handleAdicionar}
              disabled={!novaAnotacao.trim() || isCreating}
              className="min-w-[86px]"
            >
              Salvar
            </Button>
          </div>

          {/* Lista de anotações — scroll apenas nesta área */}
          {lista.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
              <EmptyState
                imageAlt="Nenhuma anotação"
                imageSrc="/images/empty-state-casos-produto.svg"
                title="Nenhuma anotação"
                description="Adicione uma anotação acima."
              />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pt-4">
              {lista.map((item) => (
                <div
                  key={item.sequencia}
                  className="flex w-full flex-col gap-2"
                >
                  {/* Linha superior: avatar + nome + data | ações */}
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50"
                        aria-hidden
                      >
                        <User className="size-3.5 text-sky-700" />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-sm font-semibold leading-5 text-foreground">
                          {item.usuario}
                        </span>
                        <span className="text-xs leading-5 text-text-secondary">
                          {formatarCriadoEm(item.data_anotacao)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {editandoId === item.sequencia ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelarEdicao}
                            className="min-w-[86px] rounded-lg"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleSalvarEdicao}
                            className="min-w-[86px]"
                          >
                            Salvar
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 rounded-lg"
                            onClick={() => handleIniciarEdicao(item)}
                            aria-label="Editar anotação"
                          >
                            <Pencil className="size-4 text-foreground" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 rounded-lg text-destructive hover:text-destructive"
                            onClick={() =>
                              setExcluirModal({
                                open: true,
                                sequencia: item.sequencia,
                              })
                            }
                            aria-label="Excluir anotação"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo: edição = textarea; leitura = bloco com borda esquerda */}
                  {editandoId === item.sequencia ? (
                    <Textarea
                      value={editandoTexto}
                      onChange={(e) => setEditandoTexto(e.target.value)}
                      className={cn(
                        " resize-none rounded-lg  text-xs font-semibold ",
                        ALTURA_MIN_ANOTACAO,
                      )}
                      autoFocus
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full rounded-lg bg-muted/30 p-2.5 border-l-4 border-primary  text-xs font-semibold leading-5 text-foreground whitespace-pre-wrap",
                        ALTURA_MIN_ANOTACAO,
                      )}
                    >
                      {item.anotacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) =>
          !open && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Excluir anotação"
        descricao="Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
