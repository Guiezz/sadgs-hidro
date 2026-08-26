// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Scale,
  Activity,
  ListChecks,
  AlertTriangle,
  Users,
  Droplets,
  Smile,
  Hammer,
  Cog,
  ShieldAlert,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside
      className={`hidden border-r bg-background md:block z-10 transition-all duration-300 ${isCollapsed ? "w-16" : "w-56"}`}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Droplets className="h-6 w-6" />
            {!isCollapsed && (
              <span className="transition-opacity duration-300">
                Sistema de Apoio à Decisão
              </span>
            )}
          </Link>
        </div>

        <TooltipProvider>
          <nav className="flex-1 flex flex-col overflow-auto px-2 text-sm font-medium lg:px-4 py-2 pb-6">
            <div className="space-y-1">
              {/* Link de Identificação */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/visao-geral"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/visao-geral") ? "bg-muted text-primary" : "text-muted-foreground"} ${isCollapsed ? "justify-center" : "gap-3"} `}
                  >
                    <Home className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Visão Geral</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Visão Geral</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/estado-de-seca"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/estado-de-seca") ? "bg-muted text-primary" : "text-muted-foreground"} ${
                      isCollapsed ? "justify-center" : "gap-3"
                    }`}
                  >
                    <Activity className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span>Monitoramento do Estado de Seca</span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Monitoramento do Estado de Seca
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/implementacao-planos-de-seca"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/implementacao-planos-de-seca") ? "bg-muted text-primary" : "text-muted-foreground"} ${
                      isCollapsed ? "justify-center" : "gap-3"
                    }`}
                  >
                    <Hammer className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span> Implementação dos Planos de Secas </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Implementação dos Planos de Secas{" "}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/planos-de-acao"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/planos-de-acao") ? "bg-muted text-primary" : "text-muted-foreground"} ${
                      isCollapsed ? "justify-center" : "gap-3"
                    }`}
                  >
                    <ListChecks className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Planos de Ação</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Planos de Ação</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/impactos"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/impactos") ? "bg-muted text-primary" : "text-muted-foreground"} ${isCollapsed ? "justify-center" : "gap-3"}`}
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Impactos</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Impactos</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/usos-agua"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/usos-agua") ? "bg-muted text-primary" : "text-muted-foreground"} ${
                      isCollapsed ? "justify-center" : "gap-3"
                    }`}
                  >
                    <Users className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Usos da Água</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Usos da Água</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/balanco-hidrico"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/balanco-hidrico") ? "bg-muted text-primary" : "text-muted-foreground"} ${isCollapsed ? "justify-center" : "gap-3"}`}
                  >
                    <Scale className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Balanço Hídrico</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Balanço Hídrico</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/simulacao"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/simulacao") ? "bg-muted text-primary" : "text-muted-foreground"} ${
                      isCollapsed ? "justify-center" : "gap-3"
                    }`}
                  >
                    <Cog className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Simulador</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Simulador</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/responsaveis"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive("/responsaveis") ? "bg-muted text-primary" : "text-muted-foreground"} ${
                      isCollapsed ? "justify-center" : "gap-3"
                    }`}
                  >
                    <Smile className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Responsáveis</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Responsáveis</TooltipContent>
              </Tooltip>
            </div>

            {/* SEÇÃO PROTEGIDA (Aparece no final do menu) */}
            {isAuthenticated && (
              <div className="pt-4 space-y-1">
                <div className="mx-3 mb-4 border-t border-border"></div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all font-semibold ${isActive("/admin") ? "bg-primary/10 text-primary" : "text-primary/70 hover:text-primary hover:bg-primary/5"} ${
                        isCollapsed ? "justify-center" : "gap-3"
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>Painel Admin</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Painel Administrativo
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${
                        isCollapsed ? "justify-center" : "gap-3"
                      }`}
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>Sair</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sair do Sistema</TooltipContent>
                </Tooltip>
              </div>
            )}
          </nav>
        </TooltipProvider>
      </div>
    </aside>
  );
}
