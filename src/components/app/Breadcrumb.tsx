"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { breadcrumbFor } from "./nav-items";

export function Breadcrumb() {
  const crumbs = breadcrumbFor(usePathname());

  return (
    <nav aria-label="Você está em">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-label">
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.href ? (
              <Link href={c.href} className="text-label no-underline hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-foreground">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
