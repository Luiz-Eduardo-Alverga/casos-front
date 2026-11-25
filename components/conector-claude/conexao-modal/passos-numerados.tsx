/**
 * Um passo do modal: o texto e, opcionalmente, um bloco logo abaixo dele (campo de copiar, nota),
 * alinhado com o texto e não com o número (decisão #26).
 */
export interface Passo {
  texto: React.ReactNode;
  bloco?: React.ReactNode;
}

/** Lista de passos com número em círculo (seções Softflow e Brainiac do modal). */
export function PassosNumerados({ passos }: { passos: Passo[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {passos.map((passo, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-text-label">
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
            <span>{passo.texto}</span>
            {passo.bloco}
          </div>
        </li>
      ))}
    </ol>
  );
}
