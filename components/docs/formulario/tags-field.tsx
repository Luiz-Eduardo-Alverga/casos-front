"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useDocTags } from "@/hooks/docs/use-doc-tags";
import type { DocFormValues } from "./schema";

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TagsField() {
  const [input, setInput] = useState("");
  const { watch, setValue } = useFormContext<DocFormValues>();
  const tags = watch("tags");
  const suggestions = useDocTags(input, Boolean(input.trim()));

  const add = (value: string) => {
    const tag = normalize(value);
    if (!tag || tags.includes(tag) || tags.length >= 20) return;
    setValue("tags", [...tags, tag], { shouldDirty: true });
    setInput("");
  };
  const remove = (tag: string) => {
    setValue(
      "tags",
      tags.filter((item) => item !== tag),
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input px-2 py-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remover tag ${tag}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(input);
            } else if (
              event.key === "Backspace" &&
              !input &&
              tags.length > 0
            ) {
              remove(tags[tags.length - 1]!);
            }
          }}
          onBlur={() => add(input)}
          className="h-8 min-w-32 flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
          placeholder="Adicionar tag"
        />
      </div>
      {input.trim() && suggestions.data?.length ? (
        <div className="rounded-md border border-border bg-popover p-1 shadow-md">
          {suggestions.data
            .filter((tag) => !tags.includes(tag))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(tag)}
              >
                {tag}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
