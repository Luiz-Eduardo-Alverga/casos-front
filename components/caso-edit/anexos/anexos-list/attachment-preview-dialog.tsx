"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { AttachmentPreviewState } from "./types";

export interface AttachmentPreviewDialogProps {
  preview: AttachmentPreviewState | null;
  onClose: () => void;
}

export function AttachmentPreviewDialog({
  preview,
  onClose,
}: AttachmentPreviewDialogProps) {
  return (
    <Dialog
      open={preview != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-[min(96vw,1400px)] max-w-[min(96vw,1400px)] translate-x-[-50%] translate-y-[-50%] border-0 bg-transparent p-0 shadow-none outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          {preview ? (
            <>
              <DialogTitle className="sr-only">{preview.name}</DialogTitle>
              <div className="relative flex max-h-[90vh] w-full flex-col items-center justify-center px-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                />
              </div>
              <DialogPrimitive.Close
                type="button"
                className="absolute right-2 top-2 z-[60] rounded-full bg-black/40 p-2 text-white ring-offset-background transition-opacity hover:bg-black/60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="size-5" />
                <span className="sr-only">Fechar</span>
              </DialogPrimitive.Close>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
