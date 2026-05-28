"use client";

import { cn } from "@/lib/utils";
import type { AuditoriaSummaryCardsProps } from "./types";
import { AUDIT_STATUS_CONFIG, AUDIT_SUMMARY_ITEMS } from "./utils";

export function AuditoriaSummaryCards({ resumo }: AuditoriaSummaryCardsProps) {
  const total = resumo.total_colaboradores || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {AUDIT_SUMMARY_ITEMS.map(({ key, resumoKey }) => {
        const config = AUDIT_STATUS_CONFIG[key];
        const item = resumo[resumoKey];
        const Icon = config.icon;

        return (
          <article
            key={key}
            className="rounded-lg border border-border-divider bg-card p-5 shadow-card flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded",
                  config.bgClass,
                )}
              >
                <Icon className={cn("h-4 w-4", config.textClass)} aria-hidden />
              </div>

              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-[0.3px]",
                    config.textClass,
                  )}
                >
                  {config.label}
                </p>
                <div className="flex items-end gap-0.5">
                  <span className="text-xl font-bold text-text-primary leading-[30px]">
                    {item.count}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary leading-[30px]">
                    / {total}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded px-2 py-1 text-xs font-bold uppercase tracking-[0.3px]",
                  config.bgClass,
                  config.textClass,
                )}
              >
                {item.percentual}%
              </span>
            </div>

            <div
              className={cn(
                "h-[5px] w-full overflow-hidden rounded-full",
                config.progressTrackClass,
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  config.progressIndicatorClass,
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, item.percentual))}%`,
                }}
              />
            </div>

            <p className="text-xs leading-4 text-text-secondary min-h-[32px]">
              {config.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
