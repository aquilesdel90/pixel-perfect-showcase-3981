import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD, PROFIT_SPLIT } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { activity, getBusiness, ownerTeam } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
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
  validateSearch: (s: Record<string, unknown>): { tab?: string | undefined } => ({ tab: typeof s["tab"] === "string" ? (s["tab"] as string) : undefined }),
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
  errorComponent: ({ error }) => <div role="alert">{(error as Error).message}</div>,
  notFoundComponent: () => <div className="p-6">Negocio no encontrado. <Link to="/negocios" className="text-primary underline">Volver</Link></div>,
});

const score = [
  { k: "Manual completo", en: "Manual completion", v: 49 },
  { k: "Finanzas verificadas", en: "Verified finances", v: 60 },
  { k: "Opera sin el dueño", en: "Runs without owner", v: 45 },
  { k: "Cumplimiento", en: "Compliance", v: 75 },
  { k: "Marca registrable", en: "Registrable brand", v: 62 },
];

function Program() {
  const { id } = Route.useLoaderData();
  const { tab = "resumen" } = Route.useSearch();
  const { t, lang } = useApp();
  const b = getBusiness(id)!;
  const inProgram = !!b.areas;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-xl font-semibold">{b.name}</h2><StagePill stage={b.stage} /></div>
          <div className="text-sm text-muted-foreground">{b.industry} · {b.city} · {b.owner} · {t("Consultor", "Consultant")}: {b.consultant}</div>
        </div>
        <div className="flex gap-4 text-sm">
          <div><div className="text-xs text-muted-foreground">{t("Madurez", "Maturity")}</div><b>{b.level}</b> {b.maturity}% <span className="text-xs text-muted-foreground">({b.assessmentVersion})</span></div>
          <div><div className="text-xs text-muted-foreground">{t("Franquiciabilidad", "Franchisability")}</div><b className="num">{b.franchisability ?? "—"}{b.franchisability ? "%" : ""}</b></div>
          <div><div className="text-xs text-muted-foreground">{t("Facturación", "Revenue")}</div><b className="num">{usd(b.revenue)}</b></div>
        </div>
      </div>

      {inProgram ? <ProgramHeader b={b} /> : (
        <Panel><p className="text-sm text-muted-foreground">{b.stage === "approved" ? t("Aprobado. Esperando firma del MOU para iniciar el programa de 180 días.", "Approved. Waiting for MOU signature to start the 180-day program.") : b.stage === "evaluated" ? t("Evaluado por el assessment. Pendiente de decisión del equipo SM.", "Evaluated. Pending SM team decision.") : t("Descartado: madurez insuficiente.", "Discarded: insufficient maturity.")}</p>
          {b.stage === "evaluated" && <div className="mt-3 flex gap-2"><Btn>{t("Aprobar", "Approve")}</Btn><Btn variant="outline">{t("Descartar", "Discard")}</Btn></div>}
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
          <Panel title={t("Puntaje de franquiciabilidad", "Franchisability score")} className="lg:col-span-1">
            <div className="num font-display text-3xl font-semibold">{b.franchisability ?? 0}%</div>
            <Bar value={b.franchisability ?? 0} tone="gold" className="mt-2 h-2" />
            <div className="mt-1 text-xs text-muted-foreground">{t("Umbral para presentar a un Bishop", "Threshold to present to a Bishop")}: {FRANCHISABILITY_THRESHOLD}%</div>
            <ul className="mt-4 space-y-2">
              {score.map((s) => <li key={s.k} className="text-xs"><div className="flex justify-between"><span>{lang === "es" ? s.k : s.en}</span><span className="num">{s.v}%</span></div><Bar value={s.v} className="mt-1" /></li>)}
            </ul>
          </Panel>
          <Panel title={t("Entregables próximos y pendientes", "Upcoming & pending deliverables")} className="lg:col-span-2"><DeliverablesTable businessId={id} /></Panel>
        </div>
      )}
      {tab === "areas" && (inProgram ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{b.areas!.map((a) => <AreaCard key={a.area} a={a} />)}</div> : <Empty />)}
      {tab === "plan" && <div className="space-y-4"><Panel title="Gantt"><Gantt businessId={id} /></Panel><Panel title={t("Entregables", "Deliverables")}><DeliverablesTable businessId={id} /></Panel></div>}
      {tab === "manual" && <ManualView businessId={id} />}
      {tab === "docs" && <DocumentsView businessId={id} />}
      {tab === "finanzas" && (
        <div className="space-y-4">
          <NumbersView />
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
            {ownerTeam.map((m) => <tr key={m.email}><td className="font-medium">{m.name}</td><td>{m.role}</td><td>{m.email}</td><td><Pill tone={m.state === "Activo" ? "green" : "amber"}>{m.state}</Pill></td></tr>)}
          </Table>
        </Panel>
      )}
      {tab === "actividad" && (
        <Panel title={t("Actividad y notas", "Activity & notes")}>
          <textarea placeholder={t("Agregar nota interna…", "Add internal note…")} className="mb-3 h-20 w-full rounded-md border bg-background p-2 text-sm" />
          <ul className="space-y-3">
            {activity.map((a, i) => <li key={i} className="border-l-2 border-gold pl-3 text-sm"><div>{a.text}</div><div className="text-xs text-muted-foreground">{a.who} · {fdate(a.date, lang)}</div></li>)}
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
