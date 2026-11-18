"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAvisosAutomaticos } from "@/hooks/mensagens/use-avisos-automaticos";
import { useMarcarMensagemComoLida } from "@/hooks/mensagens/use-marcar-mensagem-lida";
import { AvisoAutomaticoDialog } from "./aviso-automatico-dialog";

/**
 * Aviso automático bloqueante (docs/avisos, decisões #18 a #25). Montado uma vez no layout do
 * dashboard; mostra a fila um por vez, do mais antigo para o mais novo.
 */
export function AvisoAutomatico() {
  const { fila } = useAvisosAutomaticos();
  const marcar = useMarcarMensagemComoLida();
  // Marcados nesta sessão: saem da fila na hora, sem esperar o refetch de ["mensagens"].
  const [lidos, setLidos] = useState<number[]>([]);
  const [erroId, setErroId] = useState<number | null>(null);

  const pendentes = useMemo(
    () => fila.filter((m) => !lidos.includes(m.id)),
    [fila, lidos],
  );
  const atual = pendentes[0];

  if (!atual) return null;

  const handleMarcar = async () => {
    setErroId(null);
    try {
      await marcar.mutateAsync(atual.id);
      setLidos((prev) => [...prev, atual.id]);
      if (pendentes.length === 1) toast.success("Aviso marcado como lido.");
    } catch {
      // decisão #23: a janela continua aberta e o botão volta a funcionar
      setErroId(atual.id);
      toast.error("Não foi possível marcar o aviso como lido.");
    }
  };

  return (
    <AvisoAutomaticoDialog
      key={atual.id}
      mensagem={atual}
      restantes={pendentes.length - 1}
      marcando={marcar.isPending}
      erro={erroId === atual.id}
      onMarcarComoLido={handleMarcar}
    />
  );
}
