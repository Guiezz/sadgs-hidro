import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-input bg-background px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-xl bg-muted text-label">
          <Icon className="size-6" />
        </span>
      )}
      <p className="m-0 text-base font-bold text-foreground">{title}</p>
      {description && <p className="m-0 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
