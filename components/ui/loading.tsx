"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className, text = "Loading..." }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex min-h-[120px] w-full items-center justify-center rounded-md border border-dashed",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}