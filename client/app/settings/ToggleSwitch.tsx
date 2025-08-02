import { Switch } from "@/components/shadcn/switch";

interface ToggleSwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: string;
  description?: string;
}

export default function ToggleSwitch({
  checked = false,
  onCheckedChange,
  label,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-background hover:border-secondary/30 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
}
