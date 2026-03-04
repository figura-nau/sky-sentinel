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
  // Define GCS-specific color schemes
  const variants = {
    default: "border-slate-800 bg-slate-950/40 text-slate-400",
    critical:
      "border-red-500/50 bg-red-950/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    success: "border-green-500/30 bg-green-950/20 text-green-500",
    info: "border-blue-500/30 bg-blue-950/20 text-blue-400",
  };

  return (
    <Card
      className={cn(
        // Override Card's default 'flex-col' to 'flex-row' for Status Bar items
        "flex flex-row items-center gap-3 min-w-fit px-4 py-3 transition-all duration-300",
        variants[variant],
        // Logic for the pulsing Master Caution from the reference photo
        isAlerting &&
          variant === "critical" &&
          "animate-pulse border-red-500 bg-red-600/20 shadow-[0_0_25px_rgba(239,68,68,0.4)]",
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

      <div className="flex flex-col justify-center gap-0.5">
        {label && (
          <span className="text-[1rem] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">
            {label}
          </span>
        )}
        <span
          className={cn(
            "font-bold uppercase tracking-widest leading-none font-mono",
            label ? "text-[0.8rem]" : "text-[1rem]",
            // Ensure Master Caution text is readable during alerts
            variant === "critical" && "text-red-400",
          )}
        >
          {value}
        </span>
      </div>
    </Card>
  );
}
