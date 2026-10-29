import { cn } from "@/lib/utils";
import { droughtClasses, droughtLabel, normalizeDroughtState } from "@/lib/drought-state";

interface StateBadgeProps {
  state: string | null | undefined;
  size?: "sm" | "lg";
  className?: string;
}

// Estado de seca sempre com texto + ponto de cor.
export function StateBadge({ state, size = "sm", className }: StateBadgeProps) {
  const key = normalizeDroughtState(state);
  const c = droughtClasses(key);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-bold whitespace-nowrap",
        size === "lg" ? "px-4 py-2 text-lg" : "px-3 py-1 text-sm",
        c.bg,
        c.text,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("shrink-0 rounded-full", size === "lg" ? "size-3" : "size-2", c.dot)}
      />
      {key ? droughtLabel(key) : "Sem estado"}
    </span>
  );
}
