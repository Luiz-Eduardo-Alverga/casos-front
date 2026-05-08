import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";

export interface AnexosListProps {
  items: CaseAttachmentListItem[];
  isLoading?: boolean;
  canDelete?: boolean;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export type ViewMode = "grid" | "list";

export interface AttachmentPreviewState {
  url: string;
  name: string;
}
