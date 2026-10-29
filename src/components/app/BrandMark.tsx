import Link from "next/link";

interface BrandMarkProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

// Logo do SADGS: medidor de seca sobre laranja + nome.
export function BrandMark({ collapsed = false, onNavigate }: BrandMarkProps) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label={collapsed ? "SADGS — página inicial" : undefined}
      className="flex items-center gap-3 px-2 text-white no-underline hover:text-white"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-sidebar-primary"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-secondary"
        >
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M12 16l4-5" />
        </svg>
      </span>
      {!collapsed && (
        <span className="flex flex-col gap-0.5">
          <span className="font-display text-xl font-extrabold leading-none tracking-[0.02em]">
            SADGS
          </span>
          <span className="text-xs leading-tight text-sidebar-muted">
            Apoio à Decisão em Secas
          </span>
        </span>
      )}
    </Link>
  );
}
