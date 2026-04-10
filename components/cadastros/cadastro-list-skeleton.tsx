interface CadastroListSkeletonProps {
  title: string;
  description: string;
}

export function CadastroListSkeleton({
  title,
  description,
}: CadastroListSkeletonProps) {
  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      <div className="bg-card shadow-card rounded-lg shrink-0 mb-6 overflow-hidden">
        <div className="h-10 px-5 border-b border-border-divider bg-muted/40 animate-pulse" />
        <div className="p-6 pt-3 h-24 bg-muted/20 animate-pulse" />
      </div>
      <div className="flex-1 min-h-[240px] rounded-lg bg-card shadow-card overflow-hidden">
        <div className="h-12 px-5 border-b border-border-divider bg-muted/40 animate-pulse" />
        <div className="p-6 pt-3 min-h-[180px] bg-muted/20 animate-pulse" />
      </div>
    </div>
  );
}
