"use client";

import type { AcquirerListExpandedItem } from "@/components/cadastros/types";
import { AcquirerLogo } from "@/components/cadastros/adquirentes/acquirer-logo";
import { AcquirerDevicesBadges } from "@/components/cadastros/adquirentes/acquirer-devices-badges";
import { formatDeliveryDate } from "@/components/cadastros/adquirentes/adquirentes-shared";

interface StatusAdquirentesCardBodyProps {
  row: AcquirerListExpandedItem;
  onClick?: () => void;
}

export function StatusAdquirentesCardBody({
  row,
  onClick,
}: StatusAdquirentesCardBodyProps) {
  return (
    <div className="flex flex-col gap-0" onClick={onClick} role="presentation">
      <div className="flex items-center gap-2">
        <AcquirerLogo
          name={row.acquirer.name}
          logoUrl={row.acquirer.logoUrl}
          className="h-7 w-7 shrink-0 rounded-full border border-border-divider object-cover"
        />
        <span className="truncate text-xs font-semibold text-text-primary">
          {row.acquirer.name}
        </span>
      </div>

      <div className="mt-2 rounded-md border border-border-divider bg-muted/30 px-2 py-1.5 text-center">
        <p className="text-[10px] font-semibold text-text-secondary">
          Versão atual
        </p>
        <p className="text-xs font-bold text-text-primary">
          {row.currentVersionName ?? "—"}
        </p>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2 text-[10px] font-semibold">
        <div>
          <p className="text-text-secondary">Próxima versão</p>
          <p className="text-text-primary">{row.nextVersionName ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary">Enviada em</p>
          <p className="text-text-primary">
            {formatDeliveryDate(row.deliveryDate)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border-divider pt-2">
        <AcquirerDevicesBadges
          devices={row.compatibleDevices}
          maxInline={3}
          emptyLabel="Sem dispositivos"
          className="items-start"
        />
      </div>
    </div>
  );
}
