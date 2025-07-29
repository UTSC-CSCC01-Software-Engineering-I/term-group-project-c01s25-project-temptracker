import { Switch } from "@/components/shadcn/switch";

interface NotificationItemProps {
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
  title: string;
  description: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export default function NotificationItem({
  icon,
  iconBgColor,
  iconTextColor,
  title,
  description,
  checked = false,
  onCheckedChange,
}: NotificationItemProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-background hover:border-secondary/30 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-4">
        <div
          className={`w-8 h-8 ${iconBgColor} ${iconTextColor} rounded-lg flex items-center justify-center flex-shrink-0 text-sm`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="my-auto"
        />
      </div>
    </div>
  );
}
