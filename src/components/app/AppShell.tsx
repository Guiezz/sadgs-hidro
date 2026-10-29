"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/context/AuthContext";
import { ReservoirProvider } from "@/context/ReservoirContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SkipLink } from "./SkipLink";

const COLLAPSED_KEY = "sadgs_sidebar_collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // armazenamento indisponível: fica expandido
    }
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      } catch {
        // ignora
      }
      return !prev;
    });

  return (
    <AuthProvider>
      <ReservoirProvider>
        <MotionConfig reducedMotion="user">
          {pathname === "/login" ? (
            children
          ) : (
            <div className="relative flex min-h-screen w-full bg-background">
              <SkipLink />
              <Sidebar collapsed={collapsed} onToggle={toggle} />
              <div className="flex min-w-0 flex-1 flex-col">
                <Header />
                <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
                  {children}
                </main>
              </div>
            </div>
          )}
        </MotionConfig>
      </ReservoirProvider>
    </AuthProvider>
  );
}
