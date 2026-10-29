// src/app/layout.tsx
"use client";

import { useState } from "react";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { usePathname } from "next/navigation"; // Importação necessária
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ReservoirProvider } from "@/context/ReservoirContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Verifica se é a página de login
  const isLoginPage = pathname === "/login";

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <AuthProvider>
          <ReservoirProvider>
            <div className="flex min-h-screen w-full bg-background">
              {/* Só renderiza Sidebar se não for login */}
              {!isLoginPage && <Sidebar isCollapsed={isCollapsed} />}

              <div className="flex flex-1 flex-col">
                {/* Só renderiza Header se não for login */}
                {!isLoginPage && (
                  <Header
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                  />
                )}
                <main
                  className={`flex-1 overflow-auto ${!isLoginPage ? "p-4 sm:px-6 sm:py-4" : ""}`}
                >
                  {children}
                </main>
              </div>
            </div>
          </ReservoirProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
