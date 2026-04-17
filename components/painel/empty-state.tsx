"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Imagem do empty state (ex.: exportada do Figma). Quando informada, substitui o ícone. */
  imageSrc?: string;
  /** Texto alternativo da imagem (acessibilidade). */
  imageAlt?: string;
  /** Ícone exibido quando imageSrc não é informado. */
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  imageSrc,
  imageAlt = "",
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-3  px-4 text-center min-h-[200px] " +
        (className ?? "")
      }
    >
      {imageSrc ? (
        <div className="flex items-center justify-center w-full max-w-[200px] aspect-square shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-contain object-center"
          />
        </div>
      ) : Icon ? (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50">
          <Icon className="h-6 w-6 text-text-secondary" aria-hidden />
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-secondary">{title}</p>
        <p className="text-sm font-semibold max-w-[440px]">{description}</p>
      </div>
    </div>
  );
}
