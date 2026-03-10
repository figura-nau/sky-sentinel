import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card"; // Ensure this is your Tactical Card

interface StatusBarItemProps extends React.ComponentProps<typeof Card> {
  icon?: React.ReactNode;
  label?: string;
  value: string;
  variant?: "default" | "critical" | "success" | "info";
  isAlerting?: boolean;
}

export default function StatusBarItem({
  icon,
  label,
  value,
  variant = "default",
  isAlerting = false,
  className,
  ...props
}: StatusBarItemProps) {
  // Define GCS-specific color schemes using theme variables
  const variants = {
    default: "border-border bg-card/40 text-muted-foreground",
    critical:
      "border-destructive/50 bg-destructive/20 text-destructive shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    success: "border-green-500/30 bg-green-950/20 text-green-500",
    info: "border-blue-500/30 bg-blue-950/20 text-blue-400",
  };

  return (
    <Card
      className={cn(
        // Override Card's default 'flex-col' to 'flex-row' for Status Bar items
        "flex flex-row items-center gap-2 min-w-fit w-full md:w-auto px-3.5 py-2 transition-all duration-300",
        variants[variant],
        // Logic for the pulsing Master Caution from the reference photo
        isAlerting &&
          variant === "critical" &&
          "animate-pulse border-destructive bg-destructive/20 shadow-[0_0_25px_rgba(239,68,68,0.4)]",
        isAlerting &&
          variant === "success" &&
          "shadow-[0_0_15px_rgba(34,197,94,0.2)]",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="shrink-0 flex items-center justify-center">{icon}</div>
      )}

      <div className="flex justify-center text-center items-center gap-2 flex-wrap">
        {label && (
          <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">
            {label}
          </span>
        )}
        <span
          className={cn(
            "font-bold uppercase tracking-widest leading-none font-mono",
            label ? "text-[0.75rem]" : "text-[0.85rem]",
            // Ensure Master Caution text is readable during alerts
            variant === "critical" && "text-destructive",
          )}
        >
          {value}
        </span>
      </div>
    </Card>
  );
}
