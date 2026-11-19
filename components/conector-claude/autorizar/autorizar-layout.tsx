import Image from "next/image";
import { LoginBanner } from "@/components/login/login-banner";

/** Mesmo layout do login (decisão #9): banner à esquerda no desktop, conteúdo à direita. */
export function AutorizarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen min-h-screen w-full grid-cols-1 overflow-hidden bg-primary lg:grid-cols-2">
      <aside className="hidden h-full lg:block">
        <LoginBanner />
      </aside>
      <main className="flex min-h-0 flex-col overflow-auto px-4 py-6 lg:px-16 lg:py-12">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <footer className="shrink-0 pb-6 pt-4 lg:pb-8 lg:pt-6">
          <div className="flex justify-center">
            <Image
              src="/images/logo2.svg"
              alt=""
              width={150}
              height={48}
              className="object-contain"
            />
          </div>
        </footer>
      </main>
    </div>
  );
}
