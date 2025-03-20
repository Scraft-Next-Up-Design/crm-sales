"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-12 w-full animate-pulse rounded-lg bg-muted",
            className
          )}
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
