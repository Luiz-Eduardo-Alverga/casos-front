"use client";

export function VincularClienteEmptyState() {
  return (
    <section className="rounded-xl border-2 border-dashed border-border bg-card p-8 shadow-sm md:p-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex w-full max-w-[200px] items-center justify-center aspect-square shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/empty-state-casos-produto.svg"
            alt="Nenhum cliente vinculado"
            className="h-full w-full object-contain object-center"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            Nenhum Cliente Vinculado
          </h3>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
            Adicione um cliente, utilizando os campos disponíveis acima
          </p>
        </div>
      </div>
    </section>
  );
}
