import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { bishop, franchises, getBusiness } from "@/lib/mock-data";
import { Bar, LineChart, Panel, Pill, Stat, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/bishop/")({
  head: pageHead("Mi portafolio", "Inversiones del Business Bishop, recuperación y oportunidades."),
  component: Portfolio,
});

function Portfolio() {
  const { t, lang } = useApp();
  const inv = bishop.investments[0]!;
  const biz = getBusiness(inv.business)!;
  const pct = Math.round((inv.recovered / inv.invested) * 100);
  const r = bishop.recovery;
  const thisMonth = (r.real.at(-1) ?? 0) - (r.real.at(-2) ?? 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Invertido", "Invested")} value={usd(inv.invested)} sub={`${biz.name} · ${fdate(inv.date, lang)}`} tone="navy" />
        <Stat label={t("Recuperado", "Recovered")} value={usd(inv.recovered)} sub={`${pct}% ${t("en", "in")} ${r.real.length - 1} ${t("meses", "months")}`} tone="gold" />
        <Stat label={t("Participación hoy", "Current share")} value={`${inv.share}%`} sub={t("baja al estabilizarse", "drops once stabilized")} tone="green" />
        <Stat label={t("Recuperación estimada", "Estimated payback")} value={inv.paybackMonth} sub={t("al ritmo actual", "at the current pace")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title={t("Recuperación de la inversión: proyectado vs. real", "Investment recovery: projected vs. real")}>
          <LineChart labels={r.months} series={[
            { name: t("Proyectado", "Projected"), values: r.projected, tone: "var(--color-muted-foreground)", dashed: true },
            { name: t("Real", "Real"), values: r.real, tone: "var(--color-gold)" },
          ]} height={200} />
          <p className="mt-2 text-xs text-muted-foreground">{t("Acumulado desde la firma. Los datos reales salen de los reportes mensuales de la franquiciadora en QuickBooks.", "Cumulative since signing. Real figures come from the franchisor's monthly QuickBooks reports.")}</p>
        </Panel>
        <Panel title={t("Tu portafolio", "Your portfolio")}>
          <Table head={[t("Franquiciadora", "Franchisor"), t("Franquicias", "Franchises"), t("Este mes", "This month")]}>
            <tr>
              <td><div className="font-medium">{biz.name}</div><div className="text-xs text-muted-foreground">{biz.industry} · {biz.city}</div></td>
              <td className="num">{franchises.filter((f) => f.franchisor === biz.id && f.status === "operating").length} + {franchises.filter((f) => f.franchisor === biz.id && f.status === "opening").length} {t("en apertura", "opening")}</td>
              <td className="num">{usd(thisMonth)}</td>
            </tr>
          </Table>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {franchises.filter((f) => f.franchisor === biz.id).map((f) => (
              <li key={f.id} className="flex items-center justify-between"><span>{f.name}</span><Pill tone={f.status === "operating" ? "green" : "amber"} fit>{f.status === "operating" ? t("Operando", "Operating") : t("Apertura", "Opening") + " " + fdate(f.opening, lang)}</Pill></li>
            ))}
          </ul>
          <div className="mt-3"><Link to="/bishop/acuerdos" className="text-xs text-primary hover:underline">{t("Ver acuerdos firmados", "See signed agreements")}</Link></div>
        </Panel>
      </div>

      <Panel title={t("Oportunidades que SM te presenta", "Opportunities SM presents to you")} action={<Link to="/bishop/oportunidades" className="text-xs text-primary hover:underline">{t("Ver todas", "See all")}</Link>}>
        <Table head={[t("Negocio", "Business"), t("Rubro", "Industry"), t("Franquiciable", "Franchisable"), t("Inversión", "Investment"), t("Tu % año 1", "Your % year 1"), t("Estado", "Status"), ""]}>
          {bishop.opportunities.map((o) => {
            const b = getBusiness(o.business)!;
            const ready = (b.franchisability ?? 0) >= FRANCHISABILITY_THRESHOLD;
            return (
              <tr key={o.business}>
                <td className="font-medium">{b.name}</td>
                <td>{b.industry} · {b.city}</td>
                <td className="w-40"><div className="flex items-center gap-2"><Bar value={b.franchisability ?? 0} tone={ready ? "green" : "gold"} /><span className="num text-xs">{b.franchisability}%</span></div></td>
                <td className="num">{usd(o.investment)}</td>
                <td className="num">{o.share}%</td>
                <td><Pill tone={ready ? "green" : "navy"}>{ready ? t("Lista", "Ready") : t("Ficha preliminar", "Preliminary sheet")}</Pill></td>
                <td><Link to="/bishop/oportunidades/$id" params={{ id: b.id }} className="text-xs text-primary hover:underline">{t("Ver ficha", "Open sheet")}</Link></td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
