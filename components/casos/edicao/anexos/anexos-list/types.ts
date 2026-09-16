export type AttachmentDisplayItem = {
  id: string;
  filenameOriginal: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  downloadUrl: string;
};

export interface AnexosListProps {
  items: AttachmentDisplayItem[];
  isLoading?: boolean;
  canDelete?: boolean;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
  emptyMessage?: string;
}

export type ViewMode = "grid" | "list";

export interface AttachmentPreviewState {
  url: string;
  name: string;
}
