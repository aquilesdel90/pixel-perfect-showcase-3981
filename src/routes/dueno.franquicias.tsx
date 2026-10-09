import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { franchises, getBusiness } from "@/lib/mock-data";
import { OpeningChecklist, PaymentsTable, StandardsChecklist, TicketsList } from "@/components/sm/franchise";
import { DocPill } from "@/components/sm/status";
import { Panel, Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/dueno/franquicias")({
  head: pageHead("Mis franquicias", "Lo que la franquiciadora ve de cada una de sus franquicias."),
  component: OwnerFranchises,
});

function OwnerFranchises() {
  const { t, lang, ownerBusiness, manualVersions } = useApp();
  const b = getBusiness(ownerBusiness);
  const mine = franchises.filter((f) => f.franchisor === ownerBusiness);
  const current = manualVersions[ownerBusiness] ?? "v1.0";

  if (!b || b.stage !== "franchisor") {
    return <Panel><p className="text-sm text-muted-foreground">{t("Tu negocio todavía no es franquiciadora. Cuando termine el programa y firme con un Bishop, acá vas a ver tus franquicias.", "Your business is not a franchisor yet. Once the program ends and a Bishop signs, your franchises show up here.")}</p></Panel>;
  }

  return (
    <div className="space-y-6">
      {mine.map((f) => (
        <section key={f.id} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{f.name}</h3>
            <DocPill state={f.status} />
            <span className="text-sm text-muted-foreground">{t("Dueño", "Owner")}: {f.buyer} · {t("apertura", "opening")} {fdate(f.opening, lang)}</span>
            <span className="ml-auto"><Pill tone={f.manualVersion === current ? "green" : "amber"}>{f.manualVersion === current ? `${t("Manual", "Manual")} ${f.manualVersion}` : `${t("Leer", "Read")} ${current}`}</Pill></span>
          </div>
          <Panel title={t("Pagos reportados", "Reported payments")}><PaymentsTable f={f} /></Panel>
          <div className="grid gap-4 lg:grid-cols-3">
            {f.status === "opening" ? <OpeningChecklist /> : <StandardsChecklist />}
            <TicketsList franchiseId={f.id} />
            <Panel title={t("Qué ve esta franquicia", "What this franchise sees")}>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>{t("Su copia del manual, con las secciones que cambiaron marcadas.", "Its copy of the manual, with changed sections flagged.")}</li>
                <li>{t("Su checklist de estándares y el resultado de cada auditoría.", "Its standards checklist and every audit result.")}</li>
                <li>{t("Sus pagos y recibos. No ve los números de las otras franquicias ni los tuyos.", "Its payments and receipts. It does not see other franchises' numbers or yours.")}</li>
              </ul>
            </Panel>
          </div>
        </section>
      ))}
    </div>
  );
}
