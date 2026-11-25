/** Ícone em círculo, nome e pílula à direita (seções Softflow e Brainiac do modal). */
export function CabecalhoSecao({
  icone,
  nome,
  pilula,
}: {
  icone: React.ReactNode;
  nome: string;
  pilula: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-text-primary">
        {icone}
      </span>
      <span className="text-base font-semibold text-text-primary">{nome}</span>
      <span className="ml-auto">{pilula}</span>
    </div>
  );
}
