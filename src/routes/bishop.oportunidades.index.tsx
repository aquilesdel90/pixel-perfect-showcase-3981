import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { bishop, getBusiness, opportunityDetail } from "@/lib/mock-data";
import { Bar, Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/bishop/oportunidades/")({
  head: pageHead("Oportunidades", "Negocios que SM está preparando para presentar al Business Bishop."),
  component: Opportunities,
});

function Opportunities() {
  const { t, lang } = useApp();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t(`SM te presenta un negocio cuando su semáforo de franquiciabilidad llega a ${FRANCHISABILITY_THRESHOLD}%. Antes de eso ves la ficha preliminar para que vayas siguiéndolo.`, `SM presents a business once its franchisability reaches ${FRANCHISABILITY_THRESHOLD}%. Before that you see a preliminary sheet so you can follow it.`)}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {bishop.opportunities.map((o) => {
          const b = getBusiness(o.business)!;
          const d = opportunityDetail[b.id];
          if (!d) return null;
          const ready = (b.franchisability ?? 0) >= FRANCHISABILITY_THRESHOLD;
          return (
            <Link key={b.id} to="/bishop/oportunidades/$id" params={{ id: b.id }} className="panel block p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.industry} · {b.city} · {t("día", "day")} {b.day}/180</div>
                </div>
                <Pill tone={ready ? "green" : "navy"}>{ready ? t("Lista", "Ready") : t("Preliminar", "Preliminary")}</Pill>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{lang === "es" ? d.es : d.en}</p>
              <div className="mt-3 flex items-center gap-2"><Bar value={b.franchisability ?? 0} tone={ready ? "green" : "gold"} /><span className="num text-xs">{b.franchisability}%</span></div>
              <div className="num mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-muted-foreground">{t("Inversión", "Investment")}</div><b>{usd(d.investment)}</b></div>
                <div><div className="text-muted-foreground">{t("Tu % año 1", "Your % year 1")}</div><b>{d.shareYear1}%</b></div>
                <div><div className="text-muted-foreground">{t("Estimado listo", "Estimated ready")}</div><b>{fdate(d.ready, lang)}</b></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
