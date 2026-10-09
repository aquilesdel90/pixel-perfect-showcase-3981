import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { fdate } from "@/lib/format";
import { franchises, getBusiness } from "@/lib/mock-data";
import { OpeningChecklist, PaymentsTable, StandardsChecklist, TicketsList } from "@/components/sm/franchise";
import { DocPill } from "@/components/sm/status";
import { Panel, Stat } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicias/$id")({
  loader: async ({ params }) => {
    const f = franchises.find((x) => x.id === params.id);
    if (!f) throw notFound();
    return { id: f.id, name: f.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Franquicia"} — SM Platform` },
      { name: "description", content: "Detalle de franquicia: pagos, apertura, estándares y soporte." },
      { property: "og:title", content: `${loaderData?.name ?? "Franquicia"} — SM Platform` },
      { property: "og:description", content: "Detalle de franquicia en SM Platform." },
    ],
  }),
  component: FranchiseDetail,
  errorComponent: ({ error }) => <div role="alert">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="p-6">Franquicia no encontrada. <Link to="/franquicias" className="text-primary underline">Volver</Link></div>,
});

function FranchiseDetail() {
  const { id } = Route.useLoaderData();
  const { t, lang } = useApp();
  const f = franchises.find((x) => x.id === id)!;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/franquicias" className="text-sm text-muted-foreground hover:text-foreground">← {t("Franquicias", "Franchises")}</Link>
        <h2 className="text-xl font-semibold">{f.name}</h2><DocPill state={f.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Franquiciadora", "Franchisor")} value={getBusiness(f.franchisor)?.name} />
        <Stat label={t("Comprador", "Buyer")} value={f.buyer} />
        <Stat label={t("Apertura", "Opening")} value={fdate(f.opening, lang)} />
        <Stat label={t("Manual", "Manual")} value={f.manualVersion} sub={t("Copia asignada", "Assigned copy")} />
      </div>
      <Panel title={t("Pagos", "Payments")}><PaymentsTable f={f} /></Panel>
      <div className="grid gap-4 lg:grid-cols-3">
        <OpeningChecklist />
        <StandardsChecklist />
        <TicketsList franchiseId={f.id} />
      </div>
    </div>
  );
}
