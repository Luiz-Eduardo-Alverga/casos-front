import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Logos Claude ↔ Softflow (decisão #20), sobre fundo escuro (`bg-primary`).
 * `claude.svg` é o ícone oficial do press kit da Anthropic, sem alteração.
 */
export function LogosConector({ tamanho = "md" }: { tamanho?: "sm" | "md" }) {
  const lado = tamanho === "md" ? 48 : 40;
  const caixa = tamanho === "md" ? "h-12 w-12" : "h-10 w-10";
  return (
    <div className="flex items-center gap-4" aria-hidden>
      <Image
        src="/images/claude.svg"
        alt=""
        width={lado}
        height={lado}
        className={cn(caixa, "shrink-0")}
      />
      <ArrowLeftRight className="h-5 w-5 text-primary-foreground/60" />
      <span
        className={cn(
          caixa,
          "flex shrink-0 items-center justify-center rounded-lg bg-brand-yellow p-1.5",
        )}
      >
        <Image
          src="/images/icon.png"
          alt=""
          width={lado}
          height={lado}
          className="h-full w-full object-contain"
        />
      </span>
    </div>
  );
}
