"use client";

import type { RefObject } from "react";
import { FileText, Film, ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DocAnexosDropzoneProps {
  inputRef: RefObject<HTMLInputElement>;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  canInteract: boolean;
  disabled: boolean;
  onAddFiles: (files: File[]) => void;
}

export function DocAnexosDropzone({
  inputRef,
  dragOver,
  setDragOver,
  canInteract,
  disabled,
  onAddFiles,
}: DocAnexosDropzoneProps) {
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    onAddFiles(Array.from(list));
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!canInteract) return;
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (!dropped.length) return;
    onAddFiles(dropped);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.mp4,.webm,.mov,image/*,application/pdf,video/*"
        disabled={disabled}
        onChange={onInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (canInteract) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (canInteract) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (canInteract) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-sm transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/40",
          !canInteract && "pointer-events-none cursor-default opacity-50",
        )}
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-card">
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mb-1 text-sm font-bold text-foreground">
          Arraste arquivos aqui ou{" "}
          <span className="underline underline-offset-2">
            escolha do computador
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Você também pode colar captura de tela com Ctrl+V
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            PNG, JPG, WEBP (10MB)
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            PDF (25MB)
          </span>
          <span className="inline-flex items-center gap-1">
            <Film className="h-3 w-3" />
            Vídeos (100MB)
          </span>
        </div>
      </div>
    </>
  );
}
