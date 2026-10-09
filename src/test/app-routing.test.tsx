import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
const router = () => createRouter({ routeTree, context: { queryClient: new QueryClient() } });

const PAGES = [
  "/", "/negocios", "/negocios/vossler", "/franquicias", "/franquicias/bimbo-orl", "/calendario", "/catalogo", "/configuracion", "/perfil",
  "/dueno", "/dueno/manual", "/dueno/documentos", "/dueno/numeros", "/dueno/negocio",
  "/bishop", "/bishop/oportunidades", "/bishop/oportunidades/vossler", "/bishop/acuerdos",
  "/franquicia", "/franquicia/manual", "/franquicia/pagos", "/franquicia/negocio",
];

describe("App routing", () => {
  it.each(PAGES)("matches a page for %s instead of falling back to not found", (path) => {
    const matches = router().matchRoutes(path);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
