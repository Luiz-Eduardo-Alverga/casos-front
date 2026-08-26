"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Code2,
  Heading2,
  Italic,
  Link2,
  List,
  Table2,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "../shared/markdown-view";
import type { DocFormValues } from "./schema";

const actions = [
  { label: "Negrito", icon: Bold, before: "**", after: "**" },
  { label: "Itálico", icon: Italic, before: "_", after: "_" },
  { label: "Título 2", icon: Heading2, before: "## ", after: "" },
  { label: "Lista", icon: List, before: "- ", after: "" },
  { label: "Link", icon: Link2, before: "[", after: "](https://)" },
  { label: "Código", icon: Code2, before: "`", after: "`" },
  {
    label: "Tabela",
    icon: Table2,
    before: "\n| Coluna | Coluna |\n| --- | --- |\n| Valor | Valor |\n",
    after: "",
  },
] as const;

export function MarkdownEditor() {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { register, watch, setValue } = useFormContext<DocFormValues>();
  const content = watch("contentMd");
  const field = register("contentMd");

  const insert = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const next =
      content.slice(0, start) +
      before +
      selected +
      after +
      content.slice(end);
    setValue("contentMd", next, { shouldDirty: true });
    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={mode === "write" ? "bg-card shadow-sm" : undefined}
            onClick={() => setMode("write")}
          >
            Escrever
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={mode === "preview" ? "bg-card shadow-sm" : undefined}
            onClick={() => setMode("preview")}
          >
            Visualizar
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          Suporta Markdown
        </span>
      </div>
      {mode === "write" ? (
        <>
          <div className="flex flex-wrap gap-2 rounded-lg border border-border p-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => insert(action.before, action.after)}
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <Textarea
            {...field}
            ref={(element) => {
              field.ref(element);
              textareaRef.current = element;
            }}
            className="min-h-[420px] resize-y font-mono text-sm"
            placeholder="Escreva o conteúdo do documento..."
          />
        </>
      ) : (
        <div className="min-h-[420px] rounded-lg border border-border p-4">
          <MarkdownView content={content} />
        </div>
      )}
    </div>
  );
}
