"use client";

import type { RefObject } from "react";
import { FileText, Film, ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CasoFormAnexosDropzoneProps {
  inputRef: RefObject<HTMLInputElement>;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  canInteract: boolean;
  disabled: boolean;
  onAddFiles: (files: File[]) => void;
}

export function CasoFormAnexosDropzone({
  inputRef,
  dragOver,
  setDragOver,
  canInteract,
  disabled,
  onAddFiles,
}: CasoFormAnexosDropzoneProps) {
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
          "rounded-lg border-2 border-dashed h-full  flex flex-col items-center justify-center p-6 text-sm transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-sky-300 bg-sky-100/20",
          !canInteract && "opacity-50 pointer-events-none",
        )}
      >
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-card">
          <Upload className="h-5 w-5 text-blue-500" />
        </div>
        <p className="mb-1 text-sm font-bold text-foreground">
          Arraste arquivos aqui ou{" "}
          <button
            type="button"
            className="text-blue-500 underline-offset-2 hover:underline"
            disabled={!canInteract}
            onClick={() => inputRef.current?.click()}
          >
            escolha do computador
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Você também pode colar captura de tela com Ctrl+V
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
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
