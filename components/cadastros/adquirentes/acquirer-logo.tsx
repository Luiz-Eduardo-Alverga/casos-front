"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

interface AcquirerLogoProps {
  logoUrl: string | null;
  name: string;
  className?: string;
}

export function AcquirerLogo({ logoUrl, name, className }: AcquirerLogoProps) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Building2 className="h-4 w-4" aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`Logo da adquirente ${name}`}
      className={
        className ??
        "h-9 w-9 shrink-0 rounded-full object-cover border border-border-divider"
      }
      onError={() => setFailed(true)}
    />
  );
}
