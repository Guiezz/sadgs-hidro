"use client";

import { useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  return (
    <aside
      id="sidebar"
      aria-label="Navegação principal"
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col gap-7 overflow-y-auto bg-sidebar px-4 py-6 text-sidebar-foreground md:flex",
        collapsed ? "w-[72px] px-2" : "w-[248px]",
      )}
    >
      <TooltipProvider delayDuration={200}>
        <BrandMark collapsed={collapsed} />
        <NavLinks collapsed={collapsed} />
        <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-4">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              aria-label={collapsed ? "Sair" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut aria-hidden="true" className="size-[18px]" />
              {!collapsed && "Sair"}
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-[18px]" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-[18px]" />
            )}
            {!collapsed && "Recolher menu"}
          </button>
        </div>
      </TooltipProvider>
    </aside>
  );
}
