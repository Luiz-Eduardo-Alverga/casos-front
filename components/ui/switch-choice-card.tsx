import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SwitchChoiceCardProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function SwitchChoiceCard({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  className,
}: SwitchChoiceCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-[60px] items-center justify-between gap-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs font-semibold text-zinc-900">{title}</p>
        <p className="text-xs font-semibold text-zinc-900">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
        className="data-[state=checked]:bg-black"
      />
    </label>
  );
}
