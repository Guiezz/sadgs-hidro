import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageNavProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

const arrowClass =
  "flex size-11 items-center justify-center rounded-[10px] border border-border bg-card hover:bg-muted disabled:text-label disabled:opacity-50";

export function PageNav({ page, pages, onChange }: PageNavProps) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="flex flex-wrap justify-center gap-1.5 pt-2">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={arrowClass}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? "page" : undefined}
          aria-label={`Página ${n}`}
          onClick={() => onChange(n)}
          className={cn(
            "size-11 rounded-[10px] text-sm font-semibold",
            n === page ? "bg-secondary text-white" : "border border-border bg-card hover:bg-muted",
          )}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        aria-label="Próxima página"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className={arrowClass}
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
