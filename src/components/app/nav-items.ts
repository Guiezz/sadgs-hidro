// src/components/app/nav-items.ts
// Fonte única da navegação: sidebar, menu mobile e breadcrumb leem daqui.
import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  Droplet,
  Globe,
  Home,
  ListChecks,
  type LucideIcon,
  Scale,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
};

export type NavGroup = { label: string | null; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ href: "/", label: "Início", icon: Home }] },
  {
    label: "Hidrossistema",
    items: [
      { href: "/visao-geral", label: "Visão Geral", icon: Globe },
      { href: "/estado-de-seca", label: "Monitoramento", icon: Activity },
      {
        href: "/implementacao-planos-de-seca",
        label: "Implementação",
        icon: ClipboardCheck,
      },
      { href: "/planos-de-acao", label: "Planos de Ação", icon: ListChecks },
    ],
  },
  {
    label: "Análises",
    items: [
      { href: "/impactos", label: "Impactos", icon: AlertTriangle },
      { href: "/usos-agua", label: "Usos da Água", icon: Droplet },
      { href: "/balanco-hidrico", label: "Balanço Hídrico", icon: Scale },
      { href: "/simulacao", label: "Simulador", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Institucional",
    items: [
      { href: "/responsaveis", label: "Responsáveis", icon: Users },
      { href: "/admin", label: "Painel Admin", icon: ShieldAlert, requiresAuth: true },
    ],
  },
];

// Rotas fora do menu: trilha completa até elas.
const EXTRA_CRUMBS: Record<string, { label: string; href?: string }[]> = {
  "/relogio-3d": [
    { label: "Monitoramento", href: "/estado-de-seca" },
    { label: "Relógio da Seca 3D" },
  ],
  "/login": [{ label: "Entrar" }],
};

export function findNavItem(pathname: string): NavItem | null {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.href === pathname);
    if (item) return item;
  }
  return null;
}

export function breadcrumbFor(pathname: string): { label: string; href?: string }[] {
  if (pathname === "/") return [{ label: "Início" }];
  const home = { label: "Início", href: "/" };
  const extra = EXTRA_CRUMBS[pathname];
  if (extra) return [home, ...extra];
  const item = findNavItem(pathname);
  return item ? [home, { label: item.label }] : [home];
}
