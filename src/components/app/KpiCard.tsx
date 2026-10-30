import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

interface KpiCardProps {
  label: ReactNode;
  value: number | null;
  unit?: string;
  decimals?: number;
  // Texto já formatado (ex.: "−0,49"); substitui o número formatado.
  display?: string;
  note?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// Um par dt/dd para usar dentro de <dl>.
export function KpiCard({
  label,
  value,
  unit,
  decimals = 2,
  display,
  note,
  children,
  className,
}: KpiCardProps) {
  const missing = value === null || Number.isNaN(value);
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border bg-card p-5",
        className,
      )}
    >
      <dt className="text-[13px] font-semibold text-label">{label}</dt>
      <dd className="m-0 flex items-baseline gap-1.5">
        <span className="font-display text-[34px] font-bold leading-none tabular-nums text-foreground">
          {missing ? "—" : (display ?? formatNumber(value, decimals))}
        </span>
        {!missing && unit && <span className="text-base font-semibold text-muted-foreground">{unit}</span>}
      </dd>
      {note && <dd className="m-0 text-[13px] leading-snug text-muted-foreground">{note}</dd>}
      {children}
    </div>
  );
}
