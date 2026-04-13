import { GlobeLock, Signal, Wifi } from "lucide-react";
import { AcquirerLogo } from "@/components/cadastros/adquirentes/acquirer-logo";
import { formatDeliveryDate } from "@/components/cadastros/adquirentes/adquirentes-shared";
import { cn } from "@/lib/utils";
import type { PublicAcquirerListItem } from "@/services/public-api/list-acquirers";
import { AdquirentesDeviceBadges } from "./adquirentes-device-badges";

interface AdquirentesStatusCardProps {
  row: PublicAcquirerListItem;
}

function getStatusTone(status: string | null): string {
  switch (status) {
    case "Concluído":
      return " text-emerald-600";
    case "Em certificação":
      return " text-blue-700";
    case "Em teste":
      return " text-violet-700";
    case "Em desenvolvimento":
      return "bg-orange-50 text-orange-700";
    default:
      return " text-slate-600";
  }
}

export function AdquirentesStatusCard({ row }: AdquirentesStatusCardProps) {
  const statusLabel = row.status ?? "Sem status";

  return (
    <article className="space-y-6 rounded-2xl border border-[#d7dde4] bg-white p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <AcquirerLogo
            name={row.acquirer.name}
            logoUrl={row.acquirer.logoUrl}
            className="h-14 w-14 shrink-0 rounded-full border border-[#d7dde4] object-cover"
          />
          <div className="flex flex-col items-start">
            <p className="truncate text-[32px] font-bold md:text-xl">
              {row.acquirer.name}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full py-1 text-sm font-medium",
                getStatusTone(row.status),
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border bg-zinc-50 px-2 py-2 text-center">
        <p className="text-sm font-medium text-text-secondary">Versão Atual</p>
        <p className="text-lg font-bold leading-tight md:text-xl">
          {row.currentVersionName ?? "0.0.0"}
        </p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <p className="font-semibold text-muted-foreground">Próxima</p>
          <p className="text-base font-bold">{row.nextVersionName ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-muted-foreground">Enviada em</p>
          <p className="text-base font-semibold">
            {formatDeliveryDate(row.deliveryDate)}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-1 text-sm font-semibold text-muted-foreground">Conexão</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-4 py-2 text-[11px] text-blue-600">
            <Wifi className="h-4 w-4" />
            Wi-Fi
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-4 py-2 text-[11px]",
              row.acquirer.has4g
                ? "bg-blue-50 text-blue-600"
                : "bg-red-50 text-red-600",
            )}
          >
            {row.acquirer.has4g ? (
              <Signal className="h-4 w-4" />
            ) : (
              <GlobeLock className="h-4 w-4" />
            )}
            4G
          </span>
        </div>
      </div>

      <div className="border-t border-secondary pt-2">
        <p className="mb-1.5 text-sm font-semibold text-muted-foreground">
          Dispositivos compatíveis
        </p>
        <div className="flex flex-wrap gap-1.5">
          <AdquirentesDeviceBadges devices={row.compatibleDevices} />
        </div>
      </div>
    </article>
  );
}

