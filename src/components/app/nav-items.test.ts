import { expect, it } from "vitest";
import { breadcrumbFor, findNavItem, NAV_GROUPS } from "./nav-items";

it("Monitoramento rotula /estado-de-seca", () =>
  expect(findNavItem("/estado-de-seca")?.label).toBe("Monitoramento"));

it("rota desconhecida não tem item", () => expect(findNavItem("/xyz")).toBeNull());

it("breadcrumb da home", () => expect(breadcrumbFor("/")).toEqual([{ label: "Início" }]));

it("breadcrumb de seção", () =>
  expect(breadcrumbFor("/usos-agua")).toEqual([
    { label: "Início", href: "/" },
    { label: "Usos da Água" },
  ]));

it("rota fora do menu usa título próprio", () =>
  expect(breadcrumbFor("/relogio-3d")).toEqual([
    { label: "Início", href: "/" },
    { label: "Monitoramento", href: "/estado-de-seca" },
    { label: "Relógio da Seca 3D" },
  ]));

it("Admin exige auth", () => expect(findNavItem("/admin")?.requiresAuth).toBe(true));

it("grupos na ordem do design", () =>
  expect(NAV_GROUPS.map((g) => g.label)).toEqual([
    null,
    "Hidrossistema",
    "Análises",
    "Institucional",
  ]));
