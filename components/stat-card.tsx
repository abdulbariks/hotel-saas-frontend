import * as React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="size-3 text-emerald-500" />
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
