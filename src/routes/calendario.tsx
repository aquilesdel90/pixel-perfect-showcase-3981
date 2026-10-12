import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Info, Video } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { TODAY } from "@/lib/config";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { businesses, events, getBusiness, team, type EventKind } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import { addDays, getFirm, isOpen, isOverdue } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { Btn, Panel } from "@/components/sm/ui";

export const Route = createFileRoute("/calendario")({
  head: pageHead("Calendario", "Calendario semanal sincronizado con Google Calendar y Meet."),
  component: Calendar,
});

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);
// Monday of the week the sample events belong to; their `day` index counts from here.
const SAMPLE_WEEK = "2026-10-05";

// One thing on the calendar: a sample SM event, a meeting a firm set on a task, or (for a firm) a task due date.
type Item = { id: string; date: string; start: number; dur: number; title: string; sub: string; kind: EventKind; meet: boolean; proposed?: boolean | undefined; late?: boolean | undefined; taskId?: string | undefined };

function Calendar() {
  const { t, lang, role, ownerBusiness, partnerFirm } = useApp();
  const { tasks } = useTasks();
  const ownerView = role === "owner";
  const partnerView = role === "partner";
  const [biz, setBiz] = useState(ownerView ? ownerBusiness : "");
  const [mem, setMem] = useState("");
  const [offset, setOffset] = useState(0);
  const monday = addDays(SAMPLE_WEEK, offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(lang === "es" ? "es-AR" : "en-US", { weekday: "short", day: "numeric", month: "short" });

  // A partner firm sees only its own tasks: their due dates and meetings. No SM agenda, no other firms.
  const scoped = tasks.filter((x) => (partnerView ? x.firm === partnerFirm : ownerView ? x.business === ownerBusiness : !biz || x.business === biz));
  const meetingItems: Item[] = scoped.filter((x) => x.meeting && (!mem || partnerView || ownerView)).map((x) => {
    const at = x.meeting!.at;
    const [h = 9, m = 0] = at.slice(11, 16).split(":").map(Number);
    return { id: `m-${x.id}`, date: at.slice(0, 10), start: h + m / 60, dur: 1, title: `${x.code} ${x.name}`, sub: `${getBusiness(x.business)?.name ?? ""} · ${getFirm(x.firm)?.name ?? "SM"}`, kind: "meeting", meet: true, proposed: x.meeting!.status === "proposed", taskId: x.id };
  });
  const dueItems: Item[] = partnerView
    ? scoped.filter(isOpen).map((x) => ({ id: `d-${x.id}`, date: x.due, start: 0, dur: 0, title: `${t("Vence", "Due")}: ${x.code}`, sub: getBusiness(x.business)?.name ?? "", kind: "due", meet: false, late: isOverdue(x), taskId: x.id }))
    : [];
  const sampleItems: Item[] = partnerView ? [] : events
    .filter((e) => (ownerView ? e.business === ownerBusiness : (!biz || e.business === biz) && (!mem || e.member === mem || e.kind === "client")))
    .map((e) => ({ id: e.id, date: addDays(SAMPLE_WEEK, e.day), start: e.start, dur: e.dur, title: e.title, sub: getBusiness(e.business)?.name ?? "", kind: e.kind, meet: e.meet }));
  const list = [...sampleItems, ...meetingItems, ...dueItems];
  const H = 48;

  const upcoming = [...meetingItems, ...dueItems].filter((i) => i.date >= TODAY && i.date <= addDays(TODAY, 21)).sort((a, z) => a.date.localeCompare(z.date) || a.start - z.start);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Btn variant="outline" className="px-2" onClick={() => setOffset(offset - 1)}><ChevronLeft className="h-4 w-4" /><span className="sr-only">{t("Semana anterior", "Previous week")}</span></Btn>
          <Btn variant="outline" onClick={() => setOffset(0)}>{t("Esta semana", "This week")}</Btn>
          <Btn variant="outline" className="px-2" onClick={() => setOffset(offset + 1)}><ChevronRight className="h-4 w-4" /><span className="sr-only">{t("Semana siguiente", "Next week")}</span></Btn>
          <span className="num ml-2 text-sm font-medium">{fdate(days[0]!, lang)} – {fdate(days[6]!, lang)}</span>
        </div>
        {!ownerView && !partnerView && (
          <>
            <select value={biz} onChange={(e) => setBiz(e.target.value)} className="h-8 rounded-md border bg-card px-2 text-sm">
              <option value="">{t("Todos los negocios", "All businesses")}</option>
              {businesses.filter((b) => b.stage === "program" || b.stage === "franchisor").map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={mem} onChange={(e) => setMem(e.target.value)} className="h-8 rounded-md border bg-card px-2 text-sm">
              <option value="">{t("Todo el equipo", "Whole team")}</option>
              {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-navy-deep bg-primary" />{partnerView ? t("Reunión confirmada", "Confirmed meeting") : t("Reunión", "Meeting")}</span>
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-dashed border-navy-mid bg-secondary" />{t("Reunión propuesta", "Proposed meeting")}</span>
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-gold-dark bg-gold" />{t("Vencimiento", "Due date")}</span>
          {!partnerView && <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-muted-foreground/50 bg-muted-foreground/20" />{t("Evento del cliente", "Client event")}</span>}
        </div>
      </div>
      <div className="panel overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b text-xs">
            <div />
            {days.map((d) => <div key={d} className={cn("border-l px-2 py-2 font-medium capitalize", d === TODAY && "text-primary underline decoration-gold decoration-2 underline-offset-4")}>{dayLabel(d)}</div>)}
          </div>
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b text-[11px]">
            <div className="px-2 py-1 text-muted-foreground">{t("Todo el día", "All day")}</div>
            {days.map((d) => (
              <div key={d} className="min-h-7 space-y-0.5 border-l p-0.5">
                {list.filter((e) => e.kind === "due" && e.date === d).map((e) => (
                  <div key={e.id} title={e.sub} className={cn("truncate rounded-sm border px-1", e.late ? "border-danger bg-danger/10 text-danger" : "border-gold-dark bg-gold text-gold-foreground")}>
                    {e.taskId && partnerView ? <Link to="/firma/tareas/$id" params={{ id: e.taskId }} className="hover:underline">{e.title}</Link> : e.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[56px_repeat(7,1fr)]">
            <div>{HOURS.map((h) => <div key={h} className="num border-b px-2 text-[11px] text-muted-foreground" style={{ height: H }}>{h}:00</div>)}</div>
            {days.map((d) => (
              <div key={d} className="relative border-l">
                {HOURS.map((h) => <div key={h} className="border-b border-border/60" style={{ height: H }} />)}
                {list.filter((e) => e.kind !== "due" && e.date === d).map((e) => (
                  <div key={e.id} title={e.kind === "client" ? t("Evento del cliente — no editable", "Client event — not editable") : e.proposed ? t("Propuesta, falta que el dueño confirme", "Proposed, waiting for the owner to confirm") : ""}
                    className={cn("absolute inset-x-1 overflow-hidden rounded-sm px-1.5 py-1 text-[11px] leading-tight",
                      e.kind === "client" ? "cursor-not-allowed border border-muted-foreground/50 bg-muted-foreground/15 text-muted-foreground"
                        : e.proposed ? "border border-dashed border-navy-mid bg-secondary text-primary dark:text-foreground"
                        : "border border-navy-deep bg-primary text-primary-foreground dark:border-navy-mid")}
                    style={{ top: (e.start - 8) * H + 1, height: e.dur * H - 2 }}>
                    <div className="flex items-center gap-1 font-medium">{e.meet && <Video className="h-3 w-3 shrink-0" />}<span className="truncate">{e.proposed ? `${t("Propuesta", "Proposed")} · ` : ""}{e.title}</span></div>
                    <div className="truncate opacity-80">{e.sub}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {partnerView ? (
        <Panel title={t("Próximas tres semanas", "Next three weeks")}>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">{t("Nada en las próximas tres semanas.", "Nothing in the next three weeks.")}</p> : (
            <ul className="divide-y">
              {upcoming.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <div className="min-w-0">
                    {i.taskId ? <Link to="/firma/tareas/$id" params={{ id: i.taskId }} className="font-medium hover:text-primary hover:underline">{i.title}</Link> : <span className="font-medium">{i.title}</span>}
                    <div className="text-xs text-muted-foreground">{i.sub}</div>
                  </div>
                  <div className="num whitespace-nowrap text-xs text-muted-foreground">
                    {i.kind === "meeting" ? (i.proposed ? t("Reunión propuesta", "Proposed meeting") : t("Reunión", "Meeting")) : t("Vencimiento", "Due")} · {fdate(i.date, lang)}{i.kind === "meeting" ? ` · ${String(Math.floor(i.start)).padStart(2, "0")}:${String(Math.round((i.start % 1) * 60)).padStart(2, "0")}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : (
        <Panel title={<span className="inline-flex items-center gap-1.5"><Info className="h-4 w-4" />{t("Cómo funciona", "How it works")}</span>}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("Durante el Diagnóstico se crea una cuenta de Google Workspace para el negocio y se conecta al portal.", "During Diagnosis a Google Workspace account is created for the business and connected.")}</li>
            <li>{t("Las reuniones que SM agenda aparecen en el Google Calendar del cliente con link de Meet y notificación.", "Meetings SM schedules appear in the client's Google Calendar with a Meet link and notification.")}</li>
            <li>{t("Las reuniones que propone una firma aliada quedan punteadas hasta que el dueño las confirma.", "Meetings a partner firm proposes stay dashed until the owner confirms them.")}</li>
            <li>{t("Los vencimientos de entregables se publican como eventos de todo el día.", "Deliverable due dates publish as all-day events.")}</li>
            <li>{t("Los eventos propios del cliente se ven en gris y SM no puede editarlos.", "The client's own events show greyed out and SM cannot edit them.")}</li>
          </ul>
        </Panel>
      )}
    </div>
  );
}
