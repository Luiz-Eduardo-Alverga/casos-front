"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

/** Campo somente leitura com botão de copiar só com ícone (endereços e Client ID do modal). */
export function EnderecoCopiavel({
  rotulo,
  valor,
  ariaLabel,
}: {
  rotulo: string;
  valor: string;
  ariaLabel: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar; selecione o texto e copie.");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-xs font-medium text-text-label">{rotulo}</span>
      <div className="flex gap-2">
        <code
          title={valor}
          className="min-w-0 flex-1 truncate rounded-md border border-border-input px-3 py-2 font-mono text-xs text-text-primary"
        >
          {valor}
        </code>
        <Button
          variant="outline"
          size="icon"
          onClick={copiar}
          aria-label={copiado ? "Copiado" : ariaLabel}
          title={ariaLabel}
          className="shrink-0"
        >
          {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
