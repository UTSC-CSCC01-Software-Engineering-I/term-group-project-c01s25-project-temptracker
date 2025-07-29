import { Button } from "@/components/shadcn/button";

interface SecurityButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function SecurityButton({
  icon,
  title,
  description,
  onClick,
  variant = "secondary",
  ...props
}: SecurityButtonProps) {
  const colorClass =
    variant === "primary"
      ? "hover:border-primary/30 bg-primary/10 text-primary"
      : "hover:border-secondary/30 bg-secondary/10 text-secondary";

  return (
    <Button
      variant="outline"
      onClick={onClick}      
      className="p-4 h-auto rounded-xl hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 justify-start"
      {...props}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center`}
        >
          <span className="text-sm">{icon}</span>
        </div>
        <div className="text-left">
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Button>
  );
}
