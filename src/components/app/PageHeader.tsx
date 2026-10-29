import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="m-0 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] text-balance md:text-[44px]">
          {title}
        </h1>
        {description && (
          <p className="m-0 max-w-[68ch] text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
