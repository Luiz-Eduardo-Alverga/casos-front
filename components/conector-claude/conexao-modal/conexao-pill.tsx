import { cn } from "@/lib/utils";

/** Pílula "Conectado" (verde) / "Não conectado" (cinza) do menu e do modal. */
export function ConexaoPill({ conectado }: { conectado: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        conectado
          ? "bg-panel-badge-fixed-bg text-panel-badge-fixed"
          : "bg-muted text-muted-foreground",
      )}
    >
      {conectado ? "Conectado" : "Não conectado"}
    </span>
  );
}
