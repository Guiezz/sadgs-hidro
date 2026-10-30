import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  id: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function SectionCard({ id, title, description, actions, className, children }: SectionCardProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("flex flex-col gap-5 rounded-[20px] border border-border bg-card p-5 md:p-7", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={id} className="m-0 text-lg font-bold">
            {title}
          </h2>
          {description && <p className="m-0 text-sm text-muted-foreground texto-corrido">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
