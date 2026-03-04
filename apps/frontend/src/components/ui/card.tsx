import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Main Tactical Card Wrapper
 * Updated for a dark, semi-transparent GCS look with subtle glassmorphism.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-1 text-slate-100 shadow-2xl transition-all hover:border-slate-700",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Card Header with support for "CardAction" (like the three dots or settings icon)
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header flex items-center justify-between border-b border-slate-900 px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Technical Card Title
 * Uses uppercase and slightly more tracking for that "instrument panel" feel.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-xs font-bold uppercase tracking-widest text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[10px] text-slate-500 font-mono italic", className)}
      {...props}
    />
  );
}

/**
 * Card Action - Specifically for the Settings/More icons in the corner
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "text-slate-600 cursor-pointer hover:text-slate-400 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 py-2", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-4 py-3 border-t border-slate-900 text-[10px] font-mono",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
