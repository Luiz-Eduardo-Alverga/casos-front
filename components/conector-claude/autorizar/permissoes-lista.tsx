import { AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PODE = [
  { texto: "Consultar produtos, versões, projetos e pessoas", abrir: false },
  { texto: "Consultar casos pelo número", abrir: false },
  {
    texto: "Abrir casos em seu nome, depois que você confirmar no chat",
    abrir: true,
  },
];

const NAO_PODE = ["Editar, mudar status ou excluir casos", "Ver sua senha"];

/** O que o Claude vai e não vai poder fazer; sem `create-case`, "Abrir casos" sai riscado. */
export function PermissoesLista({ podeAbrirCaso }: { podeAbrirCaso: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/60">
          O Claude vai poder
        </p>
        <ul className="flex flex-col gap-2">
          {PODE.map((item) => {
            const bloqueado = item.abrir && !podeAbrirCaso;
            return (
              <li key={item.texto} className="flex items-start gap-2 text-sm">
                {bloqueado ? (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/40" />
                ) : (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                )}
                <span
                  className={cn(
                    "text-primary-foreground",
                    bloqueado && "text-primary-foreground/50 line-through",
                  )}
                >
                  {item.texto}
                </span>
              </li>
            );
          })}
        </ul>
        {!podeAbrirCaso && (
          <p className="flex items-start gap-2 rounded-md bg-status-warning/15 p-2 text-sm text-primary-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
            Seu perfil não permite abrir casos. Você pode conectar, mas o Claude
            só vai consultar.
          </p>
        )}
      </div>

      <div className="h-px w-full bg-primary-foreground/15" />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/60">
          Não vai poder
        </p>
        <ul className="flex flex-col gap-2">
          {NAO_PODE.map((texto) => (
            <li key={texto} className="flex items-start gap-2 text-sm">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/40" />
              <span className="text-primary-foreground">{texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
