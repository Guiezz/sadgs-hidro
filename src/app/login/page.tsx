"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const input =
  "h-11 w-full rounded-[10px] border border-input bg-background px-3.5 text-[15px] text-foreground placeholder:text-label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, senha });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : "Erro ao entrar. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      id="conteudo"
      className="flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:22px_22px] p-4"
    >
      <div className="flex w-full max-w-md flex-col gap-4">
        <Link href="/" className="inline-flex items-center gap-2 self-start text-sm font-semibold">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para o início
        </Link>
        <div className="flex flex-col gap-6 rounded-[20px] border border-border bg-card p-7 shadow-[0_18px_40px_-24px_rgba(88,31,2,.35)] md:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Image
              src="/logos/logo-sadgs.png"
              alt="Logotipo do SADGS"
              width={96}
              height={96}
              priority
              className="h-auto w-24"
            />
            <h1 className="m-0 font-display text-[28px] font-extrabold tracking-[-0.01em]">Acesso restrito</h1>
            <p className="m-0 text-sm text-muted-foreground">
              Entre com suas credenciais para gerenciar o andamento das ações.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-estado-severa-bg p-3 text-sm text-estado-severa-text"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p className="m-0">{error}</p>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold text-muted-foreground">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="exemplo@cogerh.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={input}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold text-muted-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className={input}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar no sistema"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
