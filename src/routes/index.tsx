import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Columns3, LayoutDashboard, Video } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { Pipeline } from "@/components/sm/pipeline";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";
import { businesses, deliverables, events, franchises, getBusiness, WEEK, WEEK_EN } from "@/lib/mock-data";
import { Bar, Panel, Pill, Table } from "@/components/sm/ui";
import { DelivPill } from "@/components/sm/status";
import { FRANCHISABILITY_THRESHOLD } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: pageHead("Embudo", "Embudo de negocios de Strategic Mates: evaluados, aprobados, en programa y franquiciadoras."),
  component: Funnel,
});

function Funnel() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const count = (s: string) => businesses.filter((b) => b.stage === s).length;
  const steps = [
    { label: t("Evaluados", "Evaluated"), n: businesses.filter((b) => b.stage !== "discarded").length },
    { label: t("Aprobados", "Approved"), n: count("approved") + count("program") + count("franchisor") },
    { label: t("En programa", "In program"), n: count("program") },
    { label: t("Franquiciadoras", "Franchisors"), n: count("franchisor") },
    { label: t("Franquicias", "Franchises"), n: franchises.length },
  ];
  const attention = deliverables.filter((d) => d.status === "overdue" || d.status === "owner");
  const inProgram = businesses.filter((b) => b.stage === "program");
  const week = lang === "es" ? WEEK : WEEK_EN;
  const [view, setView] = useState<"resumen" | "tablero">("resumen");

  const toggle = (
    <div className="flex overflow-hidden rounded-md border text-xs">
      {([["resumen", LayoutDashboard, t("Resumen", "Overview")], ["tablero", Columns3, t("Tablero", "Board")]] as const).map(([k, Icon, label]) => (
        <button key={k} onClick={() => setView(k)} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5", view === k ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
          <Icon className="h-3.5 w-3.5" />{label}
        </button>
      ))}
    </div>
  );

  if (view === "tablero") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{t("Cada negocio en su etapa. Las tarjetas con borde ámbar llevan demasiado tiempo sin moverse.", "Every business at its stage. Amber-bordered cards have sat too long without moving.")}</p>
          {toggle}
        </div>
        <Pipeline />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{toggle}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {steps.map((s, i) => (
          <div key={s.label} className="panel relative overflow-hidden px-4 py-3">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="num font-display text-2xl font-semibold">{s.n}</div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" style={{ opacity: 0.35 + i * 0.16 }} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={<span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-warning" />{t("Necesita atención", "Needs attention")}</span>}>
          <ul className="divide-y">
            {attention.map((d) => (
              <li key={d.id}>
                <Link to="/negocios/$id" params={{ id: d.business }} search={{ tab: "plan" }} className="flex items-center justify-between gap-2 py-2 hover:text-primary">
                  <div>
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{getBusiness(d.business)?.name} · {d.responsible}</div>
                  </div>
                  <DelivPill status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={t("Agenda de esta semana", "This week's agenda")} action={<Link to="/calendario" className="text-xs text-primary hover:underline">{t("Ver calendario", "Open calendar")}</Link>}>
          <ul className="divide-y">
            {events.filter((e) => e.kind === "meeting").slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{getBusiness(e.business)?.name}</div>
                </div>
                <div className="num flex items-center gap-2 text-xs text-muted-foreground">
                  {e.meet && <Video className="h-3.5 w-3.5 text-primary" />}
                  {week[e.day]} · {String(Math.floor(e.start)).padStart(2, "0")}:{e.start % 1 ? "30" : "00"}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title={t("Negocios en programa", "Businesses in program")}>
        <Table head={[t("Negocio", "Business"), t("Consultor", "Consultant"), t("Día", "Day"), t("Avance", "Progress"), t("Franquiciabilidad", "Franchisability"), "Bishop"]}>
          {inProgram.map((b) => {
            const active = (b.areas ?? []).filter((a) => !a.skipped);
            const prog = Math.round(active.reduce((s, a) => s + a.progress, 0) / Math.max(1, active.length));
            return (
              <tr key={b.id} className="cursor-pointer hover:bg-muted/60" onClick={() => navigate({ to: "/negocios/$id", params: { id: b.id } })}>
                <td><div className="font-medium">{b.name}</div><div className="text-xs text-muted-foreground">{b.industry} · {b.city}</div></td>
                <td>{b.consultant}</td>
                <td>{b.day}/180</td>
                <td className="w-40"><div className="flex items-center gap-2"><Bar value={prog} /><span className="text-xs">{prog}%</span></div></td>
                <td className="w-40"><div className="flex items-center gap-2"><Bar value={b.franchisability ?? 0} tone={(b.franchisability ?? 0) >= FRANCHISABILITY_THRESHOLD ? "green" : "gold"} /><span className="text-xs">{b.franchisability}%</span></div></td>
                <td>{b.bishop ?? <Pill>{t("Sin asignar", "Unassigned")}</Pill>}</td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
