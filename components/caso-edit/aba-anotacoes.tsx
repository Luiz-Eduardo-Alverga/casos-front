"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { AnotacaoCasoItem } from "@/interfaces/projeto-memoria";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { FileText } from "lucide-react";

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

  return (
    <>
      <Card className="bg-card shadow-card rounded-lg flex flex-col  h-full">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Anotações
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-label">
              Nova anotação
            </label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite a anotação..."
                value={novaAnotacao}
                onChange={(e) => setNovaAnotacao(e.target.value)}
                className="min-h-[80px] rounded-lg border-border-input px-[17px] py-3 resize-none"
                disabled={isCreating}
              />
              <Button
                type="button"
                onClick={handleAdicionar}
                disabled={!novaAnotacao.trim() || isCreating}
                className="h-[42px] shrink-0 self-end"
              >
                Adicionar
              </Button>
            </div>
          </div>

          {lista.length === 0 ? (
            <EmptyState
              imageAlt="Nenhuma anotação"
              icon={FileText}
              title="Nenhuma anotação"
              description="Adicione uma anotação acima."
            />
          ) : (
            <ul className="space-y-3">
              {lista.map((item) => (
                <li
                  key={item.sequencia}
                  className="border border-border-divider rounded-lg p-4 bg-card"
                >
                  {editandoId === item.sequencia ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editandoTexto}
                        onChange={(e) => setEditandoTexto(e.target.value)}
                        className="min-h-[80px] rounded-lg border-border-input px-[17px] py-3 resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelarEdicao}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSalvarEdicao}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">
                        {item.anotacoes}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-divider">
                        <span className="text-xs text-text-secondary">
                          {item.data_anotacao} · {item.usuario}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleIniciarEdicao(item)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() =>
                              setExcluirModal({
                                open: true,
                                sequencia: item.sequencia,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
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
