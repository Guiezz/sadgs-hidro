import { afterEach, describe, expect, it, vi } from "vitest";
import { isRotaIgnorada, track, umamiBeforeSend } from "./analytics";

afterEach(() => {
  delete window.umami;
});

describe("track", () => {
  it("repassa o evento para a Umami", () => {
    const spy = vi.fn();
    window.umami = { track: spy };
    track("hidrossistema-selecionado", { nome: "Acarape do Meio" });
    expect(spy).toHaveBeenCalledWith("hidrossistema-selecionado", { nome: "Acarape do Meio" });
  });

  it("não quebra quando o script não carregou (adblock, ID ausente)", () => {
    expect(() => track("qualquer")).not.toThrow();
  });

  it("não quebra quando a Umami lança erro", () => {
    window.umami = {
      track: () => {
        throw new Error("falha");
      },
    };
    expect(() => track("qualquer")).not.toThrow();
  });
});

describe("rotas internas", () => {
  it.each(["/admin", "/admin/usuarios", "/login", "/login?next=/admin", "https://sadgs.app/admin"])(
    "ignora %s",
    (url) => expect(isRotaIgnorada(url)).toBe(true),
  );

  it.each(["/", "/estado-de-seca", "/administracao-publica", "/?utm_source=congresso"])(
    "mede %s",
    (url) => expect(isRotaIgnorada(url)).toBe(false),
  );

  it("o beforeSend cancela só o envio das rotas internas", () => {
    expect(umamiBeforeSend("event", { url: "/admin" })).toBeNull();
    const payload = { url: "/visao-geral" };
    expect(umamiBeforeSend("event", payload)).toBe(payload);
  });
});
