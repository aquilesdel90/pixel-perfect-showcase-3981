import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { FEES } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { businesses, franchises } from "@/lib/mock-data";
import { DocPill } from "@/components/sm/status";
import { Panel, Stat, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicias/")({
  head: pageHead("Franquicias", "Franquiciadoras gestionadas por Strategic Mates y sus franquicias."),
  component: Franchises,
});

function Franchises() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const fr = businesses.filter((b) => b.stage === "franchisor");
  const totalSales = franchises.reduce((s, f) => s + (f.sales.at(-1)?.v ?? 0), 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Franquiciadoras", "Franchisors")} value={fr.length} />
        <Stat label={t("Franquicias", "Franchises")} value={franchises.length} />
        <Stat label={t("Ventas del mes", "Monthly sales")} value={usd(totalSales)} />
        <Stat label={t("Participación SM (regalías)", "SM share (royalties)")} value={usd(totalSales * FEES.royalty * FEES.smShareOfRoyalty)} sub={`${FEES.smShareOfRoyalty * 100}% ${t("de la regalía", "of royalty")}`} />
      </div>
      {fr.map((b) => (
        <Panel key={b.id} title={`${b.name} · ${b.city} · Bishop ${b.bishop}`}>
          <Table head={[t("Franquicia", "Franchise"), t("Comprador", "Buyer"), t("Apertura", "Opening"), t("Estado", "Status"), t("Ventas último mes", "Last month sales"), t("Regalía 5%", "Royalty 5%"), t("Marketing 3%", "Marketing 3%")]}>
            {franchises.filter((f) => f.franchisor === b.id).map((f) => {
              const s = f.sales.at(-1)?.v ?? 0;
              return (
                <tr key={f.id} className="cursor-pointer hover:bg-muted/60" onClick={() => navigate({ to: "/franquicias/$id", params: { id: f.id } })}>
                  <td className="font-medium">{f.name}</td><td>{f.buyer}</td><td>{fdate(f.opening, lang)}</td><td><DocPill state={f.status} /></td>
                  <td className="text-right">{s ? usd(s) : "—"}</td><td className="text-right">{s ? usd(s * FEES.royalty) : "—"}</td><td className="text-right">{s ? usd(s * FEES.marketing) : "—"}</td>
                </tr>
              );
            })}
          </Table>
        </Panel>
      ))}
    </div>
  );
}
