import type { ReactNode } from "react";
import { ExternalLink as ExternalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1.5 font-semibold", className)}
    >
      {children}
      <ExternalIcon aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
