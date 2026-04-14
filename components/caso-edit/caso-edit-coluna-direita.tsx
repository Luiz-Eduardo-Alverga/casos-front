"use client";

import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import {
  CasoFormProduto,
  CasoFormVersao,
  CasoFormProjeto,
  CasoFormModulo,
  CasoFormDevAtribuido,
  CasoFormQaAtribuido,
  CasoFormStatus,
} from "@/components/caso-form";
import { Check, Package, RotateCcw, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useUpdateCaso } from "@/hooks/use-update-caso";

export interface CasoEditColunaDireitaProps {
  /** ID do status retornado pela API (não o valor atual do formulário). */
  statusIdApi: number;
  /** ID do caso na rota / query `projeto-memoria`. */
  memoriaQueryId: string;
  /** Invalidar dados após atualizar status. */
  onStatusUpdated: () => void;
}

/** Próximo status ao confirmar (check), conforme regra de negócio. */
function mapStatusAvancar(statusId: number): number | null {
  switch (statusId) {
    case 1:
    case 2:
    case 4:
      return 3;
    case 3:
      return 9;
    default:
      return null;
  }
}

export function CasoEditColunaDireita({
  statusIdApi,
  memoriaQueryId,
  onStatusUpdated,
}: CasoEditColunaDireitaProps) {
  const { setValue } = useFormContext<{ status: string }>();
  const updateCaso = useUpdateCaso();

  const proximoStatus = mapStatusAvancar(statusIdApi);
  const podeAvancar = proximoStatus != null;
  const exibirReverter = statusIdApi === 3;
  const exibirAvancar = statusIdApi !== 9;

  const handleAvancarStatus = async () => {
    if (proximoStatus == null) {
      toast.error("Não há transição de status definida para o estado atual.");
      return;
    }
    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: { status: proximoStatus },
      });
      setValue("status", String(proximoStatus));
      toast.success("Status atualizado com sucesso.");
      onStatusUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar status.");
    }
  };

  const handleReverterStatus = async () => {
    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: { status: 4 },
      });
      setValue("status", "4");
      toast.success("Status atualizado com sucesso.");
      onStatusUpdated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar status.");
    }
  };

  const pending = updateCaso.isPending;

  return (
    <div className="w-full lg:w-[362px] flex flex-col gap-6 shrink-0">
      <Card className="bg-card shadow-card rounded-lg">
        <CardContent className="flex flex-row gap-2 items-end  p-6 pt-3">
          <div className="flex-1">
            <CasoFormStatus />
          </div>

          {exibirReverter && (
            <Button
              type="button"
              variant="outline"
              className="h-9 w-10 shrink-0"
              onClick={handleReverterStatus}
              disabled={pending}
              aria-label="Reverter status"
            >
              <RotateCcw className="h-4 w-4 " />
            </Button>
          )}

          {exibirAvancar && (
            <Button
              type="button"
              variant="outline"
              className="h-9 w-10 shrink-0 bg-emerald-500 hover:bg-emerald-600/90 text-white hover:text-white"
              onClick={handleAvancarStatus}
              disabled={pending || !podeAvancar}
              aria-label="Avançar status"
            >
              <Check className="h-4 w-4 " />
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CasoEditCardHeader
          title="Dados do Produto"
          icon={Package}
          shrink={false}
        />
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormProduto />
          <CasoFormVersao todas={false} />
          <CasoFormModulo required={false} />
          <CasoFormProjeto />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CasoEditCardHeader title="Atribuição" icon={Users} shrink={false} />
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormDevAtribuido />
          <CasoFormQaAtribuido />
        </CardContent>
      </Card>
    </div>
  );
}
