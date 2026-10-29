"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./Breadcrumb";
import { MobileNav } from "./MobileNav";
import { ReservoirSelect } from "./ReservoirSelect";

export function Header() {
  // A página inicial tem o próprio seletor no hero; no desktop ela fica sem header.
  const isHome = usePathname() === "/";

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border bg-card px-4 py-3.5 md:px-10",
        isHome && "md:hidden",
      )}
    >
      <div className="flex items-center gap-3">
        <MobileNav />
        {!isHome && <Breadcrumb />}
      </div>
      {!isHome && (
        <div className="flex items-center gap-2.5">
          <label htmlFor="hidro-top" className="text-[13px] font-semibold text-muted-foreground">
            Hidrossistema
          </label>
          <ReservoirSelect id="hidro-top" />
        </div>
      )}
    </header>
  );
}
