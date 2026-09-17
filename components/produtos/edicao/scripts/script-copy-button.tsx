"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { cn } from "@/lib/utils";

export interface ScriptCopyButtonProps {
  text: string;
}

export function ScriptCopyButton({ text }: ScriptCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error(PRODUTO_LABELS.erroCopiar);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "absolute right-2 top-2 h-7 gap-2 px-2 text-xs font-semibold",
        copied && "text-status-success",
      )}
      onClick={(event) => {
        event.stopPropagation();
        void handleCopy();
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? PRODUTO_LABELS.copiado : PRODUTO_LABELS.copiar}
    </Button>
  );
}
