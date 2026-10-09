import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD, PROFIT_SPLIT, PROGRAM, type AreaId } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { ACTIVATE_BELOW, activity, assessmentScores, franchisabilityBreakdown, getBusiness, ownerTeam, ownerTeams, SKIP_ABOVE, type Stage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AreaDetail } from "@/components/sm/area-detail";
import { AreaCard, ProgramHeader } from "@/components/sm/program";
import { DeliverablesTable, DocumentsView, Gantt, ManualView, NumbersView } from "@/components/sm/sections";
import { StagePill } from "@/components/sm/status";
import { Bar, Btn, Panel, Pill, Stat, Table } from "@/components/sm/ui";

const TABS = [
  ["resumen", "Resumen", "Summary"],
  ["areas", "Áreas y procesos", "Areas & processes"],
  ["plan", "Plan y Gantt", "Plan & Gantt"],
  ["manual", "Manual", "Manual"],
  ["docs", "Documentos y contratos", "Documents & contracts"],
  ["finanzas", "Finanzas", "Finance"],
  ["equipo", "Dueño y equipo", "Owner & team"],
  ["actividad", "Actividad y notas", "Activity & notes"],
] as const;

export const Route = createFileRoute("/negocios/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: string | undefined; area?: string | undefined } => ({
    tab: typeof s["tab"] === "string" ? s["tab"] : undefined,
    area: typeof s["area"] === "string" ? s["area"] : undefined,
  }),
  loader: async ({ params }) => {
    const b = getBusiness(params.id);
    if (!b) throw notFound();
    return { id: b.id, name: b.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Negocio"} — Programa — SM Platform` },
      { name: "description", content: `Programa de 180 días de ${loaderData?.name ?? "un negocio"}.` },
      { property: "og:title", content: `${loaderData?.name ?? "Negocio"} — SM Platform` },
      { property: "og:description", content: "Detalle del programa, áreas, manual y documentos." },
    ],
  }),
  component: Program,
  errorComponent: ({ error }) => <div role="alert">{error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="p-6">Negocio no encontrado. <Link to="/negocios" className="text-primary underline">Volver</Link></div>,
});

function Program() {
  const { id } = Route.useLoaderData();
  const { tab = "resumen", area } = Route.useSearch();
  const { t, lang } = useApp();
  const b = getBusiness(id)!;
  const inProgram = !!b.areas;
  const areaId = PROGRAM.areas.some((a) => a.id === area) ? (area as AreaId) : undefined;
  const score = franchisabilityBreakdown(b);
  // Local stage so Approve / Discard give visible feedback in the prototype.
  const [stage, setStage] = useState<Stage>(b.stage);
  const [notes, setNotes] = useState(activity);
  const [draft, setDraft] = useState("");
  const decide = (s: Stage) => {
    setStage(s);
    toast.success(s === "approved" ? t(`${b.name} aceptado. Se arma el plan y se envía el contrato por DocuSeal.`, `${b.name} accepted. Plan is built and the contract goes out via DocuSeal.`) : t(`${b.name} descartado.`, `${b.name} discarded.`));
  };
  const addNote = () => {
    if (!draft.trim()) return;
    setNotes([{ date: "2026-10-09", who: "Marylin Boraei", text: draft.trim() }, ...notes]);
    setDraft("");
    toast.success(t("Nota guardada", "Note saved"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-xl font-semibold">{b.name}</h2><StagePill stage={stage} /></div>
          <div className="text-sm text-muted-foreground">{b.industry} · {b.city} · {b.owner} · {t("Consultor", "Consultant")}: {b.consultant}</div>
        </div>
        <div className="flex gap-4 text-sm">
          <div><div className="text-xs text-muted-foreground">{t("Madurez", "Maturity")}</div><b>{b.level}</b> {b.maturity}% <span className="text-xs text-muted-foreground">({b.assessmentVersion})</span></div>
          <div><div className="text-xs text-muted-foreground">{t("Franquiciabilidad", "Franchisability")}</div><b className="num">{b.franchisability ?? "—"}{b.franchisability ? "%" : ""}</b></div>
          <div><div className="text-xs text-muted-foreground">{t("Facturación", "Revenue")}</div><b className="num">{usd(b.revenue)}</b></div>
        </div>
      </div>

      {inProgram ? <ProgramHeader b={b} renderArea={(a, node) => a.skipped ? node : <Link to="/negocios/$id" params={{ id }} search={{ tab: "areas", area: a.area }} className="block">{node}</Link>} /> : (
        <Panel><p className="text-sm text-muted-foreground">{stage === "approved" ? (b.substage === "mou" ? t("Contrato enviado por DocuSeal. Cuando el dueño firme arranca el día 1 del programa.", "Contract sent via DocuSeal. Day 1 of the program starts when the owner signs.") : t("Aceptado. SM arma el plan según el diagnóstico y prepara el contrato para enviarlo por DocuSeal.", "Accepted. SM builds the plan from the diagnosis and prepares the contract to send via DocuSeal.")) : stage === "evaluated" ? t("Evaluado por el assessment. Pendiente de decisión del equipo SM.", "Evaluated. Pending SM team decision.") : t("Descartado: madurez insuficiente.", "Discarded: insufficient maturity.")}</p>
          {stage === "evaluated" && <div className="mt-3 flex gap-2"><Btn onClick={() => decide("approved")}>{t("Aceptar y armar plan", "Accept and build plan")}</Btn><Btn variant="outline" onClick={() => decide("discarded")}>{t("Descartar", "Discard")}</Btn></div>}
        </Panel>
      )}

      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS.map(([k, es, en]) => (
          <Link key={k} to="/negocios/$id" params={{ id }} search={{ tab: k }} className={cn("whitespace-nowrap border-b-2 px-3 py-2 text-sm", tab === k ? "border-gold font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {lang === "es" ? es : en}
          </Link>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title={t("Diagnóstico de entrada (assessment)", "Entry diagnosis (assessment)")} className="lg:col-span-3"
            action={<span className="text-xs text-muted-foreground">{t(`Menos de ${ACTIVATE_BELOW}% activa trabajo · más de ${SKIP_ABOVE}% se omite · en el medio decide SM`, `Below ${ACTIVATE_BELOW}% activates work · above ${SKIP_ABOVE}% is skipped · in between SM decides`)}</span>}>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
              {assessmentScores(id).map((s) => {
                const tone = s.score < ACTIVATE_BELOW ? "red" : s.score > SKIP_ABOVE ? "green" : "amber";
                const feeds = PROGRAM.areas.find((a) => a.id === s.feeds)!;
                const st = b.areas?.find((a) => a.area === s.feeds);
                return (
                  <div key={s.es} className="text-xs">
                    <div className="flex justify-between"><span>{lang === "es" ? s.es : s.en}</span><span className="num">{s.score}%</span></div>
                    <Bar value={s.score} tone={tone} className="mt-1" />
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      → {feeds[lang]}{st ? (st.skipped ? ` · ${t("omitida", "skipped")}` : ` · ${t("activa", "active")}`) : s.score < ACTIVATE_BELOW ? ` · ${t("se activaría", "would activate")}` : s.score > SKIP_ABOVE ? ` · ${t("se omitiría", "would be skipped")}` : ` · ${t("a decidir", "to decide")}`}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("Casi todos los negocios entran al programa. El puntaje no filtra: define dónde va el trabajo. Un negocio con la marca resuelta no pasa por Marca y marketing.", "Almost every business joins the program. The score does not filter: it decides where the work goes. A business with its brand sorted skips Brand & marketing.")}</p>
          </Panel>
          <Panel title={t("Puntaje de franquiciabilidad", "Franchisability score")} className="lg:col-span-1">
            <div className="num font-display text-3xl font-semibold">{b.franchisability ?? 0}%</div>
            <Bar value={b.franchisability ?? 0} tone="gold" className="mt-2 h-2" />
            <div className="mt-1 text-xs text-muted-foreground">{t("Umbral para presentar a un Bishop", "Threshold to present to a Bishop")}: {FRANCHISABILITY_THRESHOLD}%</div>
            <ul className="mt-4 space-y-2">
              {score.map((s) => <li key={s.es} className="text-xs"><div className="flex justify-between"><span>{lang === "es" ? s.es : s.en}</span><span className="num">{s.v}%</span></div><Bar value={s.v} className="mt-1" /></li>)}
            </ul>
          </Panel>
          <Panel title={t("Entregables próximos y pendientes", "Upcoming & pending deliverables")} className="lg:col-span-2"><DeliverablesTable businessId={id} /></Panel>
        </div>
      )}
      {tab === "areas" && !inProgram && <Empty />}
      {tab === "areas" && inProgram && !areaId && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {b.areas!.map((a) => a.skipped ? <AreaCard key={a.area} a={a} /> : (
            <Link key={a.area} to="/negocios/$id" params={{ id }} search={{ tab: "areas", area: a.area }} className="block"><AreaCard a={a} clickable /></Link>
          ))}
        </div>
      )}
      {tab === "areas" && inProgram && areaId && (
        <div className="space-y-3">
          <Link to="/negocios/$id" params={{ id }} search={{ tab: "areas" }} className="text-sm text-muted-foreground hover:text-foreground">← {t("Todas las áreas", "All areas")}</Link>
          <AreaDetail b={b} areaId={areaId} role="sm" />
        </div>
      )}
      {tab === "plan" && <div className="space-y-4"><Panel title="Gantt"><Gantt businessId={id} /></Panel><Panel title={t("Entregables", "Deliverables")}><DeliverablesTable businessId={id} /></Panel></div>}
      {tab === "manual" && <ManualView businessId={id} />}
      {tab === "docs" && <DocumentsView businessId={id} />}
      {tab === "finanzas" && (
        <div className="space-y-4">
          <NumbersView businessId={id} />
          <Panel title={t("Reparto de utilidades (parámetro, no visible al dueño)", "Profit split (parameter, hidden from owner)")}>
            <div className="grid grid-cols-3 gap-2">
              <Stat label={t("Bishop año 1", "Bishop year 1")} value={`${PROFIT_SPLIT.bishopYear1 * 100}%`} />
              <Stat label={t("Bishop estabilizado", "Bishop stabilized")} value={`${PROFIT_SPLIT.bishopStabilized * 100}%`} />
              <Stat label={t("SM desde año 2", "SM from year 2")} value={`${PROFIT_SPLIT.smFromYear2 * 100}%`} />
            </div>
          </Panel>
        </div>
      )}
      {tab === "equipo" && (
        <Panel title={t("Dueño y equipo del negocio", "Owner & business team")}>
          <Table head={[t("Nombre", "Name"), t("Rol", "Role"), "Email", t("Estado", "State")]}>
            {(ownerTeams[id] ?? ownerTeam).map((m) => <tr key={m.email}><td className="font-medium">{m.name}</td><td>{m.role}</td><td>{m.email}</td><td><Pill tone={m.state === "Activo" ? "green" : "amber"}>{m.state}</Pill></td></tr>)}
          </Table>
        </Panel>
      )}
      {tab === "actividad" && (
        <Panel title={t("Actividad y notas", "Activity & notes")}>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("Agregar nota interna…", "Add internal note…")} className="mb-2 h-20 w-full rounded-md border bg-background p-2 text-sm" />
          <div className="mb-3"><Btn onClick={addNote}>{t("Guardar nota", "Save note")}</Btn></div>
          <ul className="space-y-3">
            {notes.map((a, i) => <li key={i} className="border-l-2 border-gold pl-3 text-sm"><div>{a.text}</div><div className="text-xs text-muted-foreground">{a.who} · {fdate(a.date, lang)}</div></li>)}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function Empty() {
  const { t } = useApp();
  return <Panel><p className="text-sm text-muted-foreground">{t("El negocio todavía no está en programa.", "This business is not in the program yet.")}</p></Panel>;
}
