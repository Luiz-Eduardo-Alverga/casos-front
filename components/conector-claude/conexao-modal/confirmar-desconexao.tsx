"use client";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { useDesconectarClaude } from "@/hooks/claude-conexao/use-claude-conexao";
import type { TipoClienteConexao } from "@/services/conector-claude/conexao";
import { NOME_CONEXAO } from "./utils";

/** Confirma desconectar um tipo de cliente (decisão #25); os outros continuam conectados. */
export function ConfirmarDesconexao({
  tipo,
  onCancelar,
  onDesconectado,
}: {
  tipo: TipoClienteConexao;
  onCancelar: () => void;
  onDesconectado: () => void;
}) {
  const desconectar = useDesconectarClaude();
  const nome = NOME_CONEXAO[tipo];

  // mutateAsync: o status novo desmonta este bloco antes dos callbacks do `mutate`.
  async function confirmar() {
    try {
      await desconectar.mutateAsync(tipo);
      toast.success(`${nome} desconectado`, { position: "top-right" });
      onDesconectado();
    } catch {
      toast.error("Não foi possível desconectar. Tente de novo.", {
        position: "top-right",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 pr-6">
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-lg font-semibold text-text-primary">
          Desconectar o {nome}?
        </DialogTitle>
        <p className="text-sm text-text-secondary">
          O {nome} não vai mais abrir nem consultar casos em seu nome até você
          conectar de novo.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancelar} disabled={desconectar.isPending}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={confirmar}
          disabled={desconectar.isPending}
        >
          {desconectar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Desconectar
        </Button>
      </div>
    </div>
  );
}
