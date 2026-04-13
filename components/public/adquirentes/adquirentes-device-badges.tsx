import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicAcquirerListItem } from "@/services/public-api/list-acquirers";

interface AdquirentesDeviceBadgesProps {
  devices: PublicAcquirerListItem["compatibleDevices"];
}

export function AdquirentesDeviceBadges({ devices }: AdquirentesDeviceBadgesProps) {
  if (devices.length === 0) {
    return (
      <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
        Nenhum até o momento
      </span>
    );
  }

  return (
    <>
      {devices.map((device) => (
        <span
          key={device.deviceId}
          className={cn(
            "inline-flex items-center rounded-lg px-2 py-2 text-[11px] font-medium leading-none",
            device.isPrimary
              ? "bg-violet-600 text-white"
              : "bg-slate-100 text-slate-500",
          )}
        >
          {device.isPrimary ? <Star className="mr-1 h-3 w-3 fill-current" /> : null}
          {device.deviceName}
        </span>
      ))}
    </>
  );
}

