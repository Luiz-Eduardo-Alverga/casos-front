import { ArrowLeftRight } from "lucide-react";

/** Logos Claude ↔ Softflow, título e texto de apoio. */
export function AutorizarCabecalho() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-4" aria-hidden>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground text-lg font-semibold text-primary">
          C
        </span>
        <ArrowLeftRight className="h-5 w-5 text-primary-foreground/60" />
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-yellow text-lg font-semibold text-primary">
          S
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-primary-foreground">
          Conectar o Claude ao Softflow
        </h1>
        <p className="text-sm text-primary-foreground/70">
          O Claude vai acessar o Softflow em seu nome, com as suas permissões.
        </p>
      </div>
    </div>
  );
}
