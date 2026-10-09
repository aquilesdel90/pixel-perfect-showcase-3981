import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { franchises, getBusiness } from "@/lib/mock-data";
import { ManualView } from "@/components/sm/sections";
import { Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/dueno/manual")({
  head: pageHead("Mi manual", "El manual de procesos: lo que SM documenta durante el programa y, al franquiciar, la enciclopedia que baja a cada franquicia."),
  component: OwnerManual,
});

function OwnerManual() {
  const { t, ownerBusiness, manualVersions } = useApp();
  const b = getBusiness(ownerBusiness)!;
  const franchisor = b.stage === "franchisor";
  const mine = franchises.filter((f) => f.franchisor === b.id);
  const current = manualVersions[b.id];

  return (
    <div className="space-y-4">
      {franchisor ? (
        <div className="panel flex flex-wrap items-center gap-3 border-l-4 border-l-gold p-4 text-sm">
          <Pill tone="navy" fit dot={false}>{current}</Pill>
          <span>{t("Esta es la enciclopedia de tu negocio. Cada franquicia tiene una copia y cuando publicás una versión nueva les baja sola, con las secciones que cambiaron marcadas.", "This is your business encyclopedia. Every franchise holds a copy, and when you publish a new version it flows down automatically with the changed sections flagged.")}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {mine.map((f) => <span key={f.id} className="mr-3">{f.name}: {f.manualVersion === current ? t("al día", "up to date") : t("pendiente de leer", "pending read")}</span>)}
            <Link to="/dueno" className="text-primary hover:underline">{t("Publicar versión", "Publish version")}</Link>
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("Esto es lo que SM está documentando de tu negocio. Cada sección se aprueba cuando vos confirmás que así se trabaja. Al terminar el programa es la enciclopedia que compra cada franquiciado.", "This is what SM is documenting about your business. Each section is approved once you confirm that is how work gets done. When the program ends it is the encyclopedia every franchisee buys.")}
        </p>
      )}
      <ManualView businessId={b.id} canApprove={!franchisor} versions={franchisor} />
    </div>
  );
}
