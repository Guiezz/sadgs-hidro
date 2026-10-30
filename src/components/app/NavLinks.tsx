"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { findNavItem, NAV_GROUPS } from "./nav-items";

interface NavLinksProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

// Lista de navegação compartilhada pela sidebar e pelo menu mobile.
export function NavLinks({ collapsed = false, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const active = findNavItem(pathname);

  return (
    <nav aria-label="Seções" className="flex flex-col gap-[22px]">
      {NAV_GROUPS.map((group, gi) => {
        const items = group.items.filter((i) => !i.requiresAuth || isAuthenticated);
        if (items.length === 0) return null;
        return (
          <div key={group.label ?? gi} className="flex flex-col gap-0.5">
            {group.label && !collapsed && (
              <span className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
                {group.label}
              </span>
            )}
            {items.map((item) => {
              const isActive = active?.href === item.href;
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm no-underline transition-colors",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground hover:text-sidebar-primary-foreground"
                      : "font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
              if (!collapsed) return link;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
