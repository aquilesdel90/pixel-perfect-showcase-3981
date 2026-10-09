import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { CURRENT } from "@/lib/config";
import { pageHead } from "@/lib/head";
import { franchises } from "@/lib/mock-data";
import { ManualView } from "@/components/sm/sections";
import { Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicia/manual")({
  head: pageHead("Manual de operaciones", "El manual que compró el franquiciado, con sus versiones y el checklist de estándares."),
  component: FranchiseManual,
});

function FranchiseManual() {
  const { t } = useApp();
  const f = franchises.find((x) => x.id === CURRENT.franchise)!;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{t("Tu copia del manual de la franquiciadora.", "Your copy of the franchisor's manual.")}</span>
        <Pill tone="navy" fit dot={false}>{f.manualVersion}</Pill>
        <Pill tone="amber" fit>{t("Compras cambió el 28 sep", "Purchasing changed Sep 28")}</Pill>
      </div>
      <ManualView businessId={f.franchisor} versions />
      <p className="text-xs text-muted-foreground">{t("Cuando SM publica una versión nueva, te llega un aviso y las secciones que cambiaron quedan marcadas. En cada auditoría se revisa lo que dice el manual.", "When SM publishes a new version you get a notice and changed sections are flagged. Each audit checks against the manual.")}</p>
    </div>
  );
}
