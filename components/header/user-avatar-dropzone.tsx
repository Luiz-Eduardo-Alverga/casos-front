"use client";

import type { RefObject } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserAvatarDropzoneProps {
  inputRef: RefObject<HTMLInputElement>;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  canInteract: boolean;
  disabled: boolean;
  onAddFiles: (files: File[]) => void;
}

export function UserAvatarDropzone({
  inputRef,
  dragOver,
  setDragOver,
  canInteract,
  disabled,
  onAddFiles,
}: UserAvatarDropzoneProps) {
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

  const openFilePicker = () => {
    if (canInteract) inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
        disabled={disabled}
        onChange={onInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (canInteract) openFilePicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (canInteract) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={openFilePicker}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:bg-muted/30",
          canInteract && "cursor-pointer",
          !canInteract && "pointer-events-none opacity-50",
        )}
      >
        <CloudUpload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-text-primary">
            Clique para enviar
          </span>{" "}
          ou arraste a imagem
        </p>
      </div>
    </>
  );
}
