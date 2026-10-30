import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartFigureProps {
  ariaLabel: string;
  legend?: { label: string; swatch: ReactNode }[];
  caption?: ReactNode;
  className?: string;
  children: ReactNode;
}

// Envolve um gráfico: legenda em HTML, resumo acessível e legenda da figura.
export function ChartFigure({ ariaLabel, legend, caption, className, children }: ChartFigureProps) {
  return (
    <figure className={cn("m-0 flex flex-col gap-3", className)}>
      {legend && legend.length > 0 && (
        <ul aria-label="Legenda" className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[13px] text-muted-foreground">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span aria-hidden="true" className="flex items-center">
                {item.swatch}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <div role="img" aria-label={ariaLabel}>
        {children}
      </div>
      {caption && <figcaption className="text-[13px] text-label">{caption}</figcaption>}
    </figure>
  );
}
