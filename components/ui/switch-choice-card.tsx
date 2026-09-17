import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SwitchChoiceCardProps {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function SwitchChoiceCard({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  className,
  disabled = false,
}: SwitchChoiceCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-[60px] items-center justify-between gap-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs font-semibold text-zinc-900">{title}</p>
        {description ? (
          <p className="text-xs font-semibold text-zinc-900">{description}</p>
        ) : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
        disabled={disabled}
        className="data-[state=checked]:bg-black"
      />
    </label>
  );
}
