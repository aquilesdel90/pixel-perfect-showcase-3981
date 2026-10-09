import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Minus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { franchisabilityBreakdown, getBusiness, opportunityDetail } from "@/lib/mock-data";
import { Bar, Btn, Panel, Pill, Stat, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/bishop/oportunidades/$id")({
  loader: async ({ params }) => {
    const b = getBusiness(params.id);
    if (!b || !opportunityDetail[b.id]) throw notFound();
    return { id: b.id, name: b.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Oportunidad"} — Ficha — SM Platform` },
      { name: "description", content: "Ficha de oportunidad para el Business Bishop." },
    ],
  }),
  component: OpportunitySheet,
  notFoundComponent: () => <div className="p-6">Oportunidad no encontrada. <Link to="/bishop/oportunidades" className="text-primary underline">Volver</Link></div>,
});

function OpportunitySheet() {
  const { id } = Route.useLoaderData();
  const { t, lang } = useApp();
  const b = getBusiness(id)!;
  const d = opportunityDetail[id]!; // the loader already checked it exists
  const ready = (b.franchisability ?? 0) >= FRANCHISABILITY_THRESHOLD;
  const [answer, setAnswer] = useState<"" | "yes" | "no">("");
  const reply = (a: "yes" | "no") => {
    setAnswer(a);
    toast.success(a === "yes" ? t("Le avisamos a SM. Te van a proponer una reunión con el dueño.", "SM was notified. They will propose a meeting with the owner.") : t("Anotado. No te volvemos a mostrar este negocio.", "Noted. We will not show this business again."));
  };
  const score = franchisabilityBreakdown(b);
  const totalBishop = d.projection.reduce((s, p) => s + p.bishop, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/bishop/oportunidades" className="text-sm text-muted-foreground hover:text-foreground">← {t("Oportunidades", "Opportunities")}</Link>
        <h2 className="text-xl font-semibold">{b.name}</h2>
        <Pill tone={ready ? "green" : "navy"}>{ready ? t("Lista para presentar", "Ready to present") : t("Ficha preliminar", "Preliminary sheet")}</Pill>
      </div>
      <p className="max-w-3xl text-sm text-muted-foreground">{lang === "es" ? d.es : d.en} {t("Preparada por Strategic Mates el", "Prepared by Strategic Mates on")} {fdate("2026-10-08", lang)}.</p>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Ventas verificadas (12 m)", "Verified revenue (12 m)")} value={usd(b.revenue)} sub="QuickBooks" />
        <Stat label={t("Inversión del Bishop", "Bishop investment")} value={usd(d.investment)} />
        <Stat label={t("Participación año 1", "Share year 1")} value={`${d.shareYear1}%`} sub={`${d.shareStable}% ${t("estabilizado", "stabilized")}`} />
        <Stat label={t("Estimado listo", "Estimated ready")} value={fdate(d.ready, lang)} sub={`${t("día", "day")} ${b.day}/180 ${t("hoy", "today")}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title={t("Proyección de la franquiciadora, 5 años", "Franchisor projection, 5 years")}>
          <Table head={[t("Año", "Year"), t("Franquicias", "Franchises"), t("Ingresos", "Revenue"), t("Resultado", "Result"), t("Para vos", "For you")]}>
            {d.projection.map((p) => <tr key={p.year}><td>{p.year}</td><td className="num">{p.franchises}</td><td className="num">{usd(p.revenue)}</td><td className="num">{usd(p.result)}</td><td className="num font-semibold">{usd(p.bishop)}</td></tr>)}
            <tr className="bg-muted/40"><td colSpan={4} className="text-right text-xs text-muted-foreground">{t("Total 5 años", "5-year total")}</td><td className="num font-semibold">{usd(totalBishop)}</td></tr>
          </Table>
          <p className="mt-2 text-xs text-muted-foreground">{t("Supuestos de SM: fee de entrada $40.000, regalía 5%, marketing 3%. Cifras ilustrativas, no son una oferta.", "SM assumptions: $40,000 entry fee, 5% royalty, 3% marketing. Illustrative figures, not an offer.")}</p>
        </Panel>
        <div className="space-y-4">
          <Panel title={t("Qué está listo y qué falta", "What is ready and what is missing")}>
            <div className="num font-display text-2xl font-semibold">{b.franchisability}%</div>
            <Bar value={b.franchisability ?? 0} tone={ready ? "green" : "gold"} className="mt-1 mb-3 h-2" />
            <ul className="space-y-2 text-sm">
              {score.map((s) => (
                <li key={s.es} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    {s.v >= 80 ? <Check className="h-4 w-4 text-success" /> : s.v >= 40 ? <Minus className="h-4 w-4 text-warning" /> : <X className="h-4 w-4 text-danger" />}
                    {lang === "es" ? s.es : s.en}
                  </span>
                  <span className="num text-xs text-muted-foreground">{s.v}%</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("Siguiente paso", "Next step")}>
            {answer === "" ? (
              <>
                <p className="text-sm text-muted-foreground">{ready ? t("Si te interesa, SM agenda una reunión con el dueño y te envía el acuerdo por DocuSeal.", "If interested, SM schedules a meeting with the owner and sends the agreement via DocuSeal.") : t(`Si te interesa, SM te avisa cuando el semáforo llegue a ${FRANCHISABILITY_THRESHOLD}% y agenda la reunión con el dueño.`, `If interested, SM notifies you when readiness reaches ${FRANCHISABILITY_THRESHOLD}% and schedules the meeting with the owner.`)}</p>
                <div className="mt-3 flex gap-2"><Btn variant="gold" onClick={() => reply("yes")}>{t("Me interesa", "I'm interested")}</Btn><Btn variant="outline" onClick={() => reply("no")}>{t("Pasar", "Pass")}</Btn></div>
              </>
            ) : (
              <Pill tone={answer === "yes" ? "green" : "grey"}>{answer === "yes" ? t("Interés registrado", "Interest recorded") : t("Descartada", "Passed")}</Pill>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
