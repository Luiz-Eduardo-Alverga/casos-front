"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_ATTACHMENTS_PER_DOC } from "@/lib/constants/case-attachments";
import { DocAnexosDropzone } from "./doc-anexos-dropzone";
import { addFilesToDocList, fileIcon } from "./doc-anexos-utils";

export interface DocAnexosUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  pasteEnabled?: boolean;
}

export function DocAnexosUpload({
  files,
  onFilesChange,
  disabled = false,
  pasteEnabled = true,
}: DocAnexosUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const canInteract = !disabled;

  const mergeIncoming = useCallback(
    (incoming: File[]) => {
      const { next, error } = addFilesToDocList(files, incoming);
      if (error) {
        toast.error(error);
        return;
      }
      if (next.length !== files.length) {
        onFilesChange(next);
      }
    },
    [files, onFilesChange],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!canInteract || !pasteEnabled) return;
      const ae = document.activeElement;
      if (
        ae instanceof HTMLInputElement ||
        ae instanceof HTMLTextAreaElement ||
        (ae instanceof HTMLElement && ae.isContentEditable)
      ) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items?.length) return;
      const pasted: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f) pasted.push(f);
        }
      }
      if (pasted.length) {
        e.preventDefault();
        mergeIncoming(pasted);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [canInteract, mergeIncoming, pasteEnabled]);

  return (
    <div className="space-y-2 rounded-lg border border-border-divider bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-sm font-semibold">Adicionar novos anexos</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Imagens, PDF ou vídeo (até {MAX_ATTACHMENTS_PER_DOC} arquivos). Você
        também pode colar captura de tela com Ctrl+V (fora de campos de texto).
      </p>
      <DocAnexosDropzone
        inputRef={inputRef}
        dragOver={dragOver}
        setDragOver={setDragOver}
        canInteract={canInteract}
        disabled={disabled}
        onAddFiles={mergeIncoming}
      />
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, idx) => {
            const Icon = fileIcon(file);
            return (
              <li
                key={`${file.name}-${file.size}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={disabled}
                  onClick={() =>
                    onFilesChange(files.filter((_, i) => i !== idx))
                  }
                  aria-label={`Remover ${file.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
