import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { CURRENT } from "@/lib/config";
import { franchises, getBusiness, manualHistory } from "@/lib/mock-data";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { ManualView } from "@/components/sm/sections";
import { Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicia/manual")({
  head: pageHead("Manual de operaciones", "La copia del manual de la franquiciadora que recibe cada franquicia, con sus versiones."),
  component: FranchiseManual,
});

function FranchiseManual() {
  const { t, lang, manualVersions } = useApp();
  const f = franchises.find((x) => x.id === CURRENT.franchise)!;
  const parent = getBusiness(f.franchisor)!;
  const current = manualVersions[f.franchisor] ?? f.manualVersion;
  const outdated = current !== f.manualVersion;
  const latest = manualHistory[f.franchisor]?.[0];
  return (
    <div className="space-y-4">
      <div className={`panel flex flex-wrap items-center gap-3 border-l-4 p-4 text-sm ${outdated ? "border-l-warning" : "border-l-primary"}`}>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span>{t(`Copia del manual de ${parent.name}. Lo mantiene la franquiciadora con SM; vos lo leés y lo aplicás, no lo editás.`, `Copy of ${parent.name}'s manual. The franchisor maintains it with SM; you read and apply it, you do not edit it.`)}</span>
        <span className="ml-auto flex items-center gap-2">
          <Pill tone="navy" fit dot={false}>{t("Tu copia", "Your copy")} {f.manualVersion}</Pill>
          {outdated ? <Pill tone="amber" fit>{t("Nueva versión", "New version")} {current} · {t("leer cambios", "read changes")}</Pill> : <Pill tone="green" fit>{t("Al día", "Up to date")}</Pill>}
        </span>
      </div>
      {latest && !outdated && <p className="text-xs text-muted-foreground">{t("Último cambio", "Last change")}: {latest.v}, {fdate(latest.date, lang)}. {latest.note}.</p>}
      <ManualView businessId={f.franchisor} versions />
      <p className="text-xs text-muted-foreground">{t("Cuando la franquiciadora publica una versión nueva, te llega un aviso y las secciones que cambiaron quedan marcadas. En cada auditoría SM revisa contra el manual.", "When the franchisor publishes a new version you get a notice and changed sections are flagged. Every SM audit checks against the manual.")}</p>
    </div>
  );
}
