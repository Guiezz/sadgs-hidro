"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menu de navegação"
          className="flex size-11 items-center justify-center rounded-[10px] border border-input bg-card text-muted-foreground md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] overflow-y-auto border-none bg-sidebar px-4 py-6 text-sidebar-foreground [&>button]:text-white [&>button]:opacity-90"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SheetDescription className="sr-only">
          Seções do Sistema de Apoio à Decisão em Secas
        </SheetDescription>
        <div className="flex flex-col gap-7">
          <BrandMark onNavigate={() => setOpen(false)} />
          <NavLinks onNavigate={() => setOpen(false)} />
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
                router.push("/");
              }}
              className="flex min-h-11 items-center gap-3 rounded-lg border-t border-sidebar-border px-3 pt-4 text-sm font-medium text-sidebar-foreground hover:text-white"
            >
              <LogOut aria-hidden="true" className="size-[18px]" />
              Sair
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
