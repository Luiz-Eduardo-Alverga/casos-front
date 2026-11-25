import { LogosConector } from "../logos-conector";

/** Logos Claude ↔ Softflow, título e texto de apoio. */
export function AutorizarCabecalho() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <LogosConector />
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
