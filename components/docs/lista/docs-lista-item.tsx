"use client";

import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DocCategoriaBadge } from "./doc-categoria-badge";
import { DocStatusBadge } from "./doc-status-badge";
import type { DocListItem } from "@/services/db-api/docs";

export function DocsListaItem({ doc }: { doc: DocListItem }) {
  const relativeDate = doc.updatedAt
    ? formatDistanceToNow(new Date(doc.updatedAt), {
        addSuffix: true,
        locale: ptBR,
      })
    : "data indisponível";

  return (
    <Link
      href={`/documentacao/${doc.id}`}
      className="flex items-center gap-4 border-t border-border-divider px-6 py-4 first:border-t-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {doc.title}
          </span>
          <DocCategoriaBadge name={doc.categoryName} />
          <DocStatusBadge status={doc.status} />
        </div>
        <p className="mt-2 truncate text-sm text-muted-foreground">
          {doc.summary || "Sem resumo"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap gap-2">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            Atualizado por {doc.updatedByName ?? "usuário desconhecido"} ·{" "}
            {relativeDate}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
