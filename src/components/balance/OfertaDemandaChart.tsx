import { CircleCheck, TriangleAlert } from "lucide-react";
import type { OfertaDemanda } from "@/lib/types";
import { garantiaStatus } from "@/lib/water";
import { formatNumber, formatSigned } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/app/SectionCard";

// Um card por garantia: atende ou déficit, folga em L/s e barras oferta × demanda.
export function OfertaDemandaChart({ data }: { data: OfertaDemanda[] }) {
  const items = data.map(garantiaStatus);
  const max = Math.max(1, ...items.flatMap((i) => [i.oferta, i.demanda]));
  const demandaTotal = items[0]?.demanda;

  return (
    <SectionCard
      id="od-titulo"
      title="Oferta x demanda por garantia"
      description={
        demandaTotal
          ? `Vazão regularizada (oferta) comparada à demanda total de ${formatNumber(demandaTotal, 0)} L/s.`
          : "Vazão regularizada (oferta) comparada à demanda total."
      }
    >
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3.5 p-0">
        {items.map((g) => (
          <li key={g.label} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="m-0 text-[15px] font-bold">{g.label}</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                  g.atende ? "bg-estado-normal-bg text-estado-normal-text" : "bg-estado-severa-bg text-estado-severa-text",
                )}
              >
                {g.atende ? (
                  <CircleCheck aria-hidden="true" className="size-3.5" />
                ) : (
                  <TriangleAlert aria-hidden="true" className="size-3.5" />
                )}
                {g.atende ? "Atende" : "Déficit"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "font-display text-[34px] leading-none font-bold tabular-nums",
                  g.atende ? "text-estado-normal-text" : "text-estado-severa-text",
                )}
              >
                {formatSigned(g.saldo, 0)}
              </span>
              <span className="text-sm text-muted-foreground">{g.saldo >= 0 ? "L/s de folga" : "L/s"}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              {[
                { label: "Oferta", value: g.oferta, cls: "bg-water" },
                { label: "Demanda", value: g.demanda, cls: "bg-secondary" },
              ].map((bar) => (
                <span key={bar.label} className="flex items-center gap-2">
                  <span className="w-16">{bar.label}</span>
                  <span className="flex-1">
                    <span
                      className={cn("block h-2.5 max-w-[180px] rounded-full", bar.cls)}
                      style={{ width: `${(bar.value / max) * 100}%` }}
                    />
                  </span>
                  <strong className="tabular-nums text-foreground">{formatNumber(bar.value, 0)}</strong>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
