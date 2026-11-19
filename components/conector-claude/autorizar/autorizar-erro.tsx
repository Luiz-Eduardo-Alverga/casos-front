import { AlertCircle } from "lucide-react";

/** Pedido inválido: nunca redireciona (decisão #4), só explica e manda voltar ao Claude. */
export function AutorizarErro({ motivo }: { motivo: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-6 text-center"
    >
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-primary-foreground">
          Não foi possível conectar
        </h1>
        <p className="text-sm text-primary-foreground/80">{motivo}</p>
        <p className="text-sm text-primary-foreground/60">
          Volte ao Claude e tente conectar de novo.
        </p>
      </div>
    </div>
  );
}
