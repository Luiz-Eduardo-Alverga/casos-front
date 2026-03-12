"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";
import { UserPlus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { Users } from "lucide-react";

export interface AbaClientesProps {
  casoId: number;
  clientes: ClienteCasoItem[];
  onAdd: (payload: {
    registro: number;
    cliente: number;
    incidente: number;
  }) => Promise<void>;
  onDelete: (sequencia: number) => Promise<void>;
  isAdding?: boolean;
}

export function AbaClientes({
  casoId,
  clientes,
  onAdd,
  onDelete,
  isAdding = false,
}: AbaClientesProps) {
  const [clienteId, setClienteId] = useState("");
  const [incidente, setIncidente] = useState("0");
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({
    open: false,
    sequencia: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const lista = Array.isArray(clientes) ? clientes : [];

  const handleAdicionar = async () => {
    const cId = Number(clienteId);
    if (!Number.isFinite(cId) || cId <= 0) return;
    await onAdd({
      registro: casoId,
      cliente: cId,
      incidente: Number(incidente) || 0,
    });
    setClienteId("");
    setIncidente("0");
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
      <Card className="bg-card shadow-card rounded-lg flex flex-col h-full">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Clientes vinculados
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
          <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border-divider bg-muted/30">
            <div className="space-y-2 min-w-[120px]">
              <Label
                htmlFor="cliente-id"
                className="text-sm font-medium text-text-label"
              >
                ID Cliente
              </Label>
              <Input
                id="cliente-id"
                type="number"
                min={1}
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                placeholder="Ex: 68703"
                className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
                disabled={isAdding}
              />
            </div>
            <div className="space-y-2 min-w-[100px]">
              <Label
                htmlFor="incidente"
                className="text-sm font-medium text-text-label"
              >
                Incidente
              </Label>
              <Input
                id="incidente"
                type="number"
                min={0}
                value={incidente}
                onChange={(e) => setIncidente(e.target.value)}
                className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
                disabled={isAdding}
              />
            </div>
            <Button
              type="button"
              onClick={handleAdicionar}
              disabled={!clienteId.trim() || isAdding}
              className="h-[42px] shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5 mr-2" />
              Adicionar
            </Button>
          </div>

          {lista.length === 0 ? (
            <EmptyState
              imageAlt="Nenhum cliente vinculado"
              icon={Users}
              title="Nenhum cliente vinculado"
              description="Adicione um cliente acima."
            />
          ) : (
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
                      <span className="text-sm text-text-primary">
                        {item.cliente}
                      </span>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) =>
          !open && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Remover cliente do caso"
        descricao="Tem certeza que deseja remover este vínculo? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
