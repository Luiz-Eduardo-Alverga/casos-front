"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { CasoFormAnexosDialog } from "./caso-form-anexos-dialog";
import { CasoFormAnexosEmbedded } from "./caso-form-anexos-embedded";
import { addFilesToList } from "./utils";
import type { CasoFormAnexosProps } from "./types";

export type { CasoFormAnexosProps } from "./types";

export function CasoFormAnexos({
  files,
  onFilesChange,
  disabled = false,
  embedded = false,
  open,
  onOpenChange,
}: CasoFormAnexosProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;

  const rbacReady = permissionsLoaded();
  const canCreate = !rbacReady || hasPermission("create-case-attachment");
  const canInteract = !disabled && canCreate;

  const setDialogOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const mergeIncoming = useCallback(
    (incoming: File[]) => {
      const { next, error } = addFilesToList(files, incoming);
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
      if (!canInteract) return;
      if (!embedded && !dialogOpen) return;
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
  }, [canInteract, embedded, dialogOpen, mergeIncoming]);

  const removeAt = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  if (!canCreate) {
    return null;
  }

  if (embedded) {
    return (
      <CasoFormAnexosEmbedded
        inputRef={inputRef}
        dragOver={dragOver}
        setDragOver={setDragOver}
        canInteract={canInteract}
        disabled={disabled}
        files={files}
        onRemoveAt={removeAt}
        onAddFiles={mergeIncoming}
      />
    );
  }

  return (
    <CasoFormAnexosDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      inputRef={inputRef}
      dragOver={dragOver}
      setDragOver={setDragOver}
      canInteract={canInteract}
      disabled={disabled}
      files={files}
      onRemoveAt={removeAt}
      onAddFiles={mergeIncoming}
    />
  );
}
