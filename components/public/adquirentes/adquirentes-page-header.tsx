import Image from "next/image";

/** Shell horizontal compartilhado com `AdquirentesPage` (filtros + grid mesma largura que o header). */
export const ADQUIRENTES_PAGE_CONTENT_SHELL =
  "mx-auto box-border w-full min-w-0 max-w-full px-4 py-4 md:px-14";

export function AdquirentesPageHeader() {
  return (
    <header className="w-full min-w-0 shrink-0 border-b border-public-border bg-background">
      <div
        className={`flex items-center justify-between ${ADQUIRENTES_PAGE_CONTENT_SHELL}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-initial">
          <Image
            src="/images/logosmart.svg"
            alt="Softcom"
            width={48}
            height={28}
            className="shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-6">
              Adquirentes Softcom Smart
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Acompanhamento de versões e dispositivos
            </p>
          </div>
        </div>
        <div className="hidden shrink-0 lg:block">
          <Image
            src="/images/logo.svg"
            alt="Softcom"
            width={160}
            height={48}
            className="h-12 w-40 object-contain"
          />
        </div>
      </div>
    </header>
  );
}
