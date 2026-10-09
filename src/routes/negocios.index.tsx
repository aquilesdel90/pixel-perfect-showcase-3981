import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { usd } from "@/lib/format";
import { businesses, team, type Stage } from "@/lib/mock-data";
import { Panel, Table } from "@/components/sm/ui";
import { StagePill } from "@/components/sm/status";

export const Route = createFileRoute("/negocios/")({
  head: pageHead("Negocios", "Lista de negocios evaluados, aprobados, en programa y franquiciadoras."),
  component: Businesses,
});

function Businesses() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<"" | Stage>("");
  const [cons, setCons] = useState("");
  const rows = businesses.filter((b) =>
    (!q || (b.name + b.owner + b.city + b.industry).toLowerCase().includes(q.toLowerCase())) &&
    (!stage || b.stage === stage) && (!cons || b.consultant === cons));
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Buscar negocio, dueño, ciudad…", "Search business, owner, city…")}
            className="h-8 w-full rounded-md border bg-background pl-8 pr-2 text-sm" />
        </div>
        <select value={stage} onChange={(e) => setStage(e.target.value as Stage | "")} className="h-8 rounded-md border bg-background px-2 text-sm">
          <option value="">{t("Todas las etapas", "All stages")}</option>
          <option value="evaluated">{t("Evaluado", "Evaluated")}</option>
          <option value="approved">{t("Aprobado", "Approved")}</option>
          <option value="program">{t("En programa", "In program")}</option>
          <option value="franchisor">{t("Franquiciadora", "Franchisor")}</option>
          <option value="discarded">{t("Descartado", "Discarded")}</option>
        </select>
        <select value={cons} onChange={(e) => setCons(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-sm">
          <option value="">{t("Todos los consultores", "All consultants")}</option>
          {team.map((m) => <option key={m.id}>{m.name}</option>)}
        </select>
      </div>
      <Table head={[t("Negocio", "Business"), t("Rubro", "Industry"), t("Ciudad", "City"), t("Dueño", "Owner"), t("Facturación anual", "Yearly revenue"), t("Madurez", "Maturity"), t("Etapa", "Stage"), t("Consultor", "Consultant")]}>
        {rows.map((b) => (
          <tr key={b.id} className="cursor-pointer hover:bg-muted/60" onClick={() => navigate({ to: "/negocios/$id", params: { id: b.id } })}>
            <td className="font-medium">{b.name}</td>
            <td>{b.industry}</td>
            <td>{b.city}</td>
            <td>{b.owner}</td>
            <td className="text-right">{usd(b.revenue)}</td>
            <td><b>{b.level}</b> <span className="text-muted-foreground">{b.maturity}%</span></td>
            <td><StagePill stage={b.stage} /></td>
            <td>{b.consultant}</td>
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">{t("Sin resultados", "No results")}</td></tr>}
      </Table>
    </Panel>
  );
}
