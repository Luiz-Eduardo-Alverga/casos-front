"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

export function MarkdownView({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 text-sm text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h2: ({ className: headingClass, ...props }) => (
            <h2
              className={cn(
                "mt-6 text-xl font-bold first:mt-0",
                headingClass,
              )}
              {...props}
            />
          ),
          h3: ({ className: headingClass, ...props }) => (
            <h3
              className={cn("mt-4 text-base font-semibold", headingClass)}
              {...props}
            />
          ),
          p: ({ className: paragraphClass, ...props }) => (
            <p
              className={cn(
                "leading-6 text-foreground",
                paragraphClass,
              )}
              {...props}
            />
          ),
          ul: ({ className: listClass, ...props }) => (
            <ul
              className={cn("list-disc space-y-2 pl-6", listClass)}
              {...props}
            />
          ),
          ol: ({ className: listClass, ...props }) => (
            <ol
              className={cn("list-decimal space-y-2 pl-6", listClass)}
              {...props}
            />
          ),
          pre: ({ className: preClass, ...props }) => (
            <pre
              className={cn(
                "overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm",
                preClass,
              )}
              {...props}
            />
          ),
          code: ({
            className: codeClass,
            ...props
          }: ComponentPropsWithoutRef<"code">) => (
            <code
              className={cn(
                "rounded bg-muted px-1 py-0.5 font-mono text-sm",
                codeClass,
              )}
              {...props}
            />
          ),
          table: ({ className: tableClass, ...props }) => (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table
                className={cn(
                  "w-full border-collapse text-left text-sm",
                  tableClass,
                )}
                {...props}
              />
            </div>
          ),
          th: ({ className: cellClass, ...props }) => (
            <th
              className={cn(
                "border-b border-border-divider bg-muted px-4 py-2 font-semibold",
                cellClass,
              )}
              {...props}
            />
          ),
          td: ({ className: cellClass, ...props }) => (
            <td
              className={cn(
                "border-b border-border-divider px-4 py-2 last:border-b-0",
                cellClass,
              )}
              {...props}
            />
          ),
          a: ({ className: linkClass, ...props }) => (
            <a
              className={cn(
                "font-medium text-status-info underline underline-offset-4",
                linkClass,
              )}
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
