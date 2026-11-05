// Métricas de visitação com a Umami Cloud (sem cookies). Setup em docs/analytics.md.

export type EventData = Record<string, string | number | boolean>;

type UmamiPayload = { url?: string } & Record<string, unknown>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: EventData) => void };
    umamiBeforeSend?: (type: string, payload: UmamiPayload) => UmamiPayload | null;
  }
}

// Telas internas da equipe não entram nas métricas de visitação.
const ROTAS_IGNORADAS = ["/admin", "/login"];

export function isRotaIgnorada(url: string | undefined): boolean {
  if (!url) return false;
  let path: string;
  try {
    path = new URL(url, "http://local").pathname;
  } catch {
    return false;
  }
  return ROTAS_IGNORADAS.some((r) => path === r || path.startsWith(`${r}/`));
}

// Chamado pelo script da Umami antes de cada envio; retornar null cancela.
export function umamiBeforeSend(_type: string, payload: UmamiPayload): UmamiPayload | null {
  return isRotaIgnorada(payload?.url) ? null : payload;
}

export function track(name: string, data?: EventData): void {
  if (typeof window === "undefined") return;
  try {
    window.umami?.track(name, data);
  } catch {
    // Métrica nunca pode derrubar a tela.
  }
}
