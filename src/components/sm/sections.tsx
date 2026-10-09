import { CheckCircle2, FileSignature, Paperclip, Upload, Workflow } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { PROGRAM } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { contracts, deliverables, documents, financials, getBusiness, manualSections, programStart } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { DelivPill, DocPill } from "./status";
import { Bar, Bars, Btn, Panel, Pill, Stat, Table } from "./ui";

export function areaName(id: string, lang: "es" | "en") {
  if (id === "diag") return PROGRAM.gates.diagnostico[lang];
  if (id === "cierre") return PROGRAM.gates.cierre[lang];
  return PROGRAM.areas.find((a) => a.id === id)?.[lang] ?? id;
}

export function DeliverablesTable({ businessId, onlyOwner }: { businessId: string; onlyOwner?: boolean }) {
  const { t, lang } = useApp();
  const owner = getBusiness(businessId)?.owner;
  const rows = deliverables.filter((d) => d.business === businessId && (!onlyOwner || d.status === "owner" || d.responsible === owner));
  return (
    <Table head={[t("Entregable", "Deliverable"), t("Área", "Area"), t("Responsable", "Responsible"), t("Inicio", "Start"), t("Vence", "Due"), t("Estado", "Status"), ""]}>
      {rows.map((d) => (
        <tr key={d.id}>
          <td className="font-medium">{d.name}</td>
          <td>{areaName(d.area, lang)}</td>
          <td>{d.responsible}</td>
          <td>{fdate(d.start, lang)}</td>
          <td>{fdate(d.due, lang)}</td>
          <td><DelivPill status={d.status} /></td>
          <td className="text-muted-foreground">{d.attachments > 0 && <span className="inline-flex items-center gap-1 text-xs"><Paperclip className="h-3 w-3" />{d.attachments}</span>}</td>
        </tr>
      ))}
    </Table>
  );
}

export function Gantt({ businessId }: { businessId: string }) {
  const { lang, t } = useApp();
  const startDate = programStart[businessId] ?? "2026-07-27";
  const today = getBusiness(businessId)?.day ?? 0;
  const s0 = new Date(startDate).getTime();
  const dayOf = (iso: string) => Math.round((new Date(iso).getTime() - s0) / 864e5) + 1;
  const rows = deliverables.filter((d) => d.business === businessId);
  const pct = (d: number) => `${(Math.max(0, Math.min(180, d)) / 180) * 100}%`;
  const color = { planned: "bg-muted-foreground/40", progress: "bg-primary", delivered: "bg-success", overdue: "bg-danger", owner: "bg-warning" };
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="relative ml-56 h-6 border-b text-[11px] text-muted-foreground">
          {[1, 15, 30, 60, 90, 120, 150, 180].map((d) => <span key={d} className="absolute -translate-x-1/2" style={{ left: pct(d) }}>{t("D", "D")}{d}</span>)}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 ml-56 right-0">
            <div className="absolute inset-y-0 bg-gold/10" style={{ left: 0, width: pct(15) }} />
            <div className="absolute inset-y-0 bg-gold/10" style={{ left: pct(150), right: 0 }} />
            <div className="absolute inset-y-0 w-px bg-danger" style={{ left: pct(today) }} title={`${t("Hoy, día", "Today, day")} ${today}`} />
          </div>
          {rows.map((d) => {
            const a = dayOf(d.start), b = dayOf(d.due);
            return (
              <div key={d.id} className="flex h-8 items-center border-b border-border/50">
                <div className="w-56 shrink-0 truncate pr-2 text-xs"><span className="text-muted-foreground">{areaName(d.area, lang)} · </span>{d.name}</div>
                <div className="relative h-full flex-1">
                  <div className={cn("absolute top-2 h-4 rounded", color[d.status])} style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ManualView({ businessId, canApprove, versions }: { businessId: string; canApprove?: boolean; versions?: boolean }) {
  const { t } = useApp();
  const [secs, setSecs] = useState(() => manualSections(businessId));
  const [sel, setSel] = useState(secs[0]?.id ?? "");
  const cur = secs.find((s) => s.id === sel)!;
  const total = Math.round(secs.reduce((s, x) => s + x.pct, 0) / secs.length);
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="panel p-2">
        <div className="px-2 py-2 text-xs text-muted-foreground">{t("Completitud total", "Total completion")} <b className="num text-foreground">{total}%</b></div>
        {secs.map((s) => (
          <button key={s.id} onClick={() => setSel(s.id)} className={cn("w-full rounded-md px-3 py-2 text-left text-sm", sel === s.id ? "bg-accent" : "hover:bg-muted")}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.name}</span>
              {s.approved && <CheckCircle2 className="h-4 w-4 text-success" />}
            </div>
            <div className="mt-1 flex items-center gap-2"><Bar value={s.pct} tone={s.pct === 100 ? "green" : "navy"} /><span className="num text-xs">{s.pct}%</span></div>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <Panel title={cur.name} action={
          <div className="flex items-center gap-2">
            {versions && <Pill tone="navy" fit dot={false}>v1.3</Pill>}
            {cur.approved ? <Pill tone="green">{t("Aprobado por el dueño", "Approved by owner")}</Pill>
              : canApprove ? <Btn variant="gold" onClick={() => setSecs(secs.map((s) => s.id === sel ? { ...s, approved: true } : s))}>{t("Aprobar sección", "Approve section")}</Btn>
              : <Pill tone="amber">{t("Pendiente de aprobación", "Awaiting approval")}</Pill>}
          </div>}>
          <div className="flex h-44 flex-col items-center justify-center rounded-md border-2 border-dashed bg-muted/40 text-muted-foreground">
            <Workflow className="mb-2 h-6 w-6" />
            <div className="text-sm">{t("Mapa de proceso (editor BPMN embebido)", "Process map (embedded BPMN editor)")}</div>
          </div>
          <h4 className="mt-4 text-sm font-semibold">{t("Procedimiento", "Procedure")}</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("Recepción de la solicitud y registro en el CRM.", "Receive request and log it in the CRM.")}</li>
            <li>{t("Visita técnica y relevamiento con checklist estándar.", "Site visit using the standard checklist.")}</li>
            <li>{t("Presupuesto con plantilla aprobada; firma del cliente.", "Quote with approved template; client signature.")}</li>
            <li>{t("Traspaso a operación con ficha de proyecto.", "Handoff to operations with project sheet.")}</li>
          </ol>
          <h4 className="mt-4 text-sm font-semibold">{t("Formularios", "Forms")}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Ficha de cliente", "Checklist de visita", "Plantilla de presupuesto"].map((f) => <Pill key={f} fit dot={false}>{f}</Pill>)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function DocumentsView({ businessId, owner }: { businessId: string; owner?: boolean }) {
  const { t, lang } = useApp();
  const [docs, setDocs] = useState(documents.filter((d) => d.business === businessId));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("Documentos solicitados", "Requested documents")}>
        <ul className="divide-y">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 py-2">
              <div>
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{fdate(d.date, lang)}</div>
              </div>
              <div className="flex items-center gap-2">
                <DocPill state={d.state} />
                {owner && d.state === "requested" && (
                  <Btn variant="outline" onClick={() => setDocs(docs.map((x) => x.id === d.id ? { ...x, state: "received" } : x))}><Upload className="h-3.5 w-3.5" />{t("Subir", "Upload")}</Btn>
                )}
                {!owner && d.state === "received" && (
                  <Btn variant="outline" onClick={() => setDocs(docs.map((x) => x.id === d.id ? { ...x, state: "reviewed" } : x))}>{t("Marcar revisado", "Mark reviewed")}</Btn>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title={t("Contratos (DocuSeal)", "Contracts (DocuSeal)")}>
        <ul className="divide-y">
          {contracts.filter((c) => c.business === businessId).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{fdate(c.date, lang)}</div>
                </div>
              </div>
              <DocPill state={c.state} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t("El estado se actualiza automáticamente cuando se firma en DocuSeal.", "Status updates automatically when signed in DocuSeal.")}</p>
      </Panel>
    </div>
  );
}

export function NumbersView({ businessId = "vossler" }: { businessId?: string }) {
  const { t } = useApp();
  const f = financials[businessId] ?? financials["vossler"]!;
  const rev = f.revenue.at(-1) ?? 0, rev0 = f.revenue[0] ?? 1;
  const margin = f.margin.at(-1) ?? 0, margin0 = f.margin[0] ?? 0;
  const cash = f.cash.at(-1) ?? 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Facturación (sep)", "Revenue (Sep)")} value={usd(rev)} sub={`+${Math.round((rev / rev0 - 1) * 100)}% ${t("vs mayo", "vs May")}`} />
        <Stat label={t("Margen neto", "Net margin")} value={`${margin}%`} sub={`${t("antes", "before")} ${margin0}%`} />
        <Stat label={t("Caja", "Cash")} value={usd(cash)} />
        <Stat label={t("Fuente", "Source")} value="QuickBooks" sub={t("Sincronizado hoy", "Synced today")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("Facturación mensual", "Monthly revenue")}><Bars values={f.revenue} labels={f.months} /></Panel>
        <Panel title={t("Qué cambió desde que empezaste", "What changed since you started")}>
          <Table head={[t("Indicador", "Metric"), t("Al inicio", "At start"), t("Hoy", "Now")]}>
            {f.changes.map((c) => <tr key={c.metric}><td>{c.metric}</td><td className="text-muted-foreground">{c.before}</td><td className="font-semibold text-success">{c.now}</td></tr>)}
          </Table>
        </Panel>
      </div>
    </div>
  );
}
