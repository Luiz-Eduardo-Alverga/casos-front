"use client";

import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_ATTACHMENTS_PER_CASE } from "@/lib/constants/case-attachments";
import { CasoFormAnexosDropzone } from "./caso-form-anexos-dropzone";
import { fileIcon } from "./utils";
import type { RefObject } from "react";

export interface CasoFormAnexosEmbeddedProps {
  inputRef: RefObject<HTMLInputElement>;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  canInteract: boolean;
  disabled: boolean;
  files: File[];
  onRemoveAt: (index: number) => void;
  onAddFiles: (files: File[]) => void;
}

export function CasoFormAnexosEmbedded({
  inputRef,
  dragOver,
  setDragOver,
  canInteract,
  disabled,
  files,
  onRemoveAt,
  onAddFiles,
}: CasoFormAnexosEmbeddedProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border-divider bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <Paperclip className="h-3.5 w-3.5 text-text-primary" />
        <p className="text-sm font-semibold text-text-primary">
          Adicionar novos anexos
        </p>
      </div>
      <p className="text-xs text-text-secondary">
        Imagens, PDF ou vídeo (até {MAX_ATTACHMENTS_PER_CASE} arquivos). Você
        também pode colar captura de tela com Ctrl+V (fora de campos de
        texto).
      </p>
      <CasoFormAnexosDropzone
        inputRef={inputRef}
        dragOver={dragOver}
        setDragOver={setDragOver}
        canInteract={canInteract}
        disabled={disabled}
        onAddFiles={onAddFiles}
      />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => {
            const Icon = fileIcon(file);
            return (
              <li
                key={`${file.name}-${file.size}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border-divider bg-white px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-text-secondary" />
                  <span className="truncate text-text-primary">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-text-secondary text-xs">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={disabled}
                  onClick={() => onRemoveAt(idx)}
                  aria-label={`Remover ${file.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
