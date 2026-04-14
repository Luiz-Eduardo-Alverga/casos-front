import Image from "next/image";

export function AdquirentesPageHeader() {
  return (
    <header className="border-b border-[#d7dde4] bg-white">
      <div className="flex w-full items-center justify-between px-4 py-4 md:px-14">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logosmart.svg"
            alt="Softcom"
            width={48}
            height={28}
          />
          <div>
            <h1 className="text-xl font-bold leading-6">
              Adquirentes Softcom Smart
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Acompanhamento de versões e dispositivos
            </p>
          </div>
        </div>
        <Image
          src="/images/logo.svg"
          className="sr-only lg:not-sr-only"
          alt="Softcom"
          width={180}
          height={28}
          priority
        />
      </div>
    </header>
  );
}
