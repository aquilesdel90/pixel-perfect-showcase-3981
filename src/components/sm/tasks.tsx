import { Link } from "@tanstack/react-router";
import { CalendarClock, Check, MessageSquare, Paperclip, Plus, Quote } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { PROGRAM } from "@/lib/config";
import { fdate } from "@/lib/format";
import { getBusiness } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import {
  daysLeft, dueThisWeek, FIRMS, firmShortName, getFirm, isOpen, isOverdue, lastDelivery, nextAction, openRequests,
  shownStatus, SM_USER, STATUS_LABEL, waitingOwner, type Party, type Task,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { StepDots } from "./program";
import { Btn, Panel, Pill, Stat, Table } from "./ui";

// Who is looking at a task. The partner firm and SM share the same task screens; SM gets extra controls.
export type TaskViewer = "partner" | "sm";

export const areaLabel = (id: string, lang: "es" | "en") => PROGRAM.areas.find((a) => a.id === id)?.[lang] ?? id;
export const stepLabel = (step: number, lang: "es" | "en") => (PROGRAM.steps[Math.min(step, 4)] ?? PROGRAM.steps[0])[lang];
const meetingWhen = (at: string, lang: "es" | "en") => `${fdate(at.slice(0, 10), lang)} · ${at.slice(11, 16)}`;

export function TaskStatusPill({ task }: { task: Task }) {
  const { lang } = useApp();
  const s = STATUS_LABEL[shownStatus(task)];
  return <Pill tone={s.tone}>{s[lang]}</Pill>;
}

// Grey bordered tag naming who executes the task: an external firm by name, SM's own team as "SM".
export function FirmPill({ firmId }: { firmId: string | null }) {
  const { t } = useApp();
  return <Pill tone="grey" fit dot={false}>{firmShortName(firmId) ?? t("Tercero", "Third party")}</Pill>;
}

// Due date with the days left in words; overdue dates are red.
export function DueText({ task, block }: { task: Task; block?: boolean | undefined }) {
  const { t, lang } = useApp();
  const left = daysLeft(task.due);
  const late = isOverdue(task);
  const rel = !isOpen(task) ? "" : left === 0 ? t("hoy", "today") : left > 0 ? t(`en ${left} d`, `in ${left} d`) : t(`hace ${-left} d`, `${-left} d ago`);
  return (
    <span className={cn("num whitespace-nowrap", block && "block", late && "font-semibold text-danger")}>
      {fdate(task.due, lang)}{rel && <span className={cn("ml-1 text-xs", late ? "text-danger" : "text-muted-foreground")}>({rel})</span>}
    </span>
  );
}

export function StepCell({ task }: { task: Task }) {
  const { lang } = useApp();
  return (
    <div className="w-28">
      <div className="text-xs">{task.status === "accepted" ? (lang === "es" ? "Completa" : "Complete") : stepLabel(task.step, lang)}</div>
      <div className="-mt-1"><StepDots step={task.status === "accepted" ? 5 : task.step} /></div>
    </div>
  );
}

// The four numbers a firm (or an SM consultant) checks first.
export function TaskCounters({ tasks }: { tasks: Task[] }) {
  const { t } = useApp();
  const overdue = tasks.filter(isOverdue).length;
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <Stat label={t("Abiertas", "Open")} value={tasks.filter(isOpen).length} tone="navy" />
      <Stat label={t("Vencen esta semana", "Due this week")} value={tasks.filter(dueThisWeek).length} tone="amber" />
      <Stat label={t("Vencidas", "Overdue")} value={overdue} {...(overdue > 0 ? { tone: "red" as const } : {})} />
      <Stat label={t("Esperando al dueño", "Waiting for the owner")} value={tasks.filter(waitingOwner).length} sub={t("Entregadas, sin aceptar todavía", "Delivered, not accepted yet")} />
    </div>
  );
}

// Small flags next to a task: what the firm is waiting on from the owner and whether a meeting is on the table.
function Signals({ task }: { task: Task }) {
  const { t, lang } = useApp();
  const asks = openRequests(task).length;
  return (
    <div className="flex flex-wrap gap-1">
      {asks > 0 && <Pill tone="amber" fit>{t(`Espera al dueño (${asks})`, `Waiting on owner (${asks})`)}</Pill>}
      {task.meeting && (
        <Pill tone={task.meeting.status === "proposed" ? "navy" : "green"} fit dot={false}>
          {task.meeting.status === "proposed" ? t("Reunión propuesta", "Meeting proposed") : t("Reunión", "Meeting")} {meetingWhen(task.meeting.at, lang)}
        </Pill>
      )}
    </div>
  );
}

function TaskLink({ task, viewer, children, className }: { task: Task; viewer: TaskViewer; children: ReactNode; className?: string | undefined }) {
  return viewer === "partner"
    ? <Link to="/firma/tareas/$id" params={{ id: task.id }} className={className}>{children}</Link>
    : <Link to="/red/tareas/$id" params={{ id: task.id }} className={className}>{children}</Link>;
}

// Start happens right in the list; delivering always opens the detail, where the note and the file go.
function RowAction({ task, viewer }: { task: Task; viewer: TaskViewer }) {
  const { t } = useApp();
  const { start } = useTasks();
  const action = nextAction(task);
  if (!action) return null;
  if (action === "start") {
    return <Btn variant="outline" onClick={() => { start(task.id); toast.success(t(`${task.code} en proceso`, `${task.code} in progress`)); }}>{t("Empezar", "Start")}</Btn>;
  }
  return <TaskLink task={task} viewer={viewer}><Btn>{action === "deliver" ? t("Entregar", "Deliver") : t("Reentregar", "Redeliver")}</Btn></TaskLink>;
}

// "Mis tareas": the list grouped by business, densest first-look a firm or a consultant needs.
export function TaskList({ tasks, viewer, showFirm }: { tasks: Task[]; viewer: TaskViewer; showFirm?: boolean | undefined }) {
  const { t, lang } = useApp();
  const groups = [...new Set(tasks.map((x) => x.business))].map((id) => ({ b: getBusiness(id)!, items: tasks.filter((x) => x.business === id).sort((a, z) => a.due.localeCompare(z.due)) }));
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">{t("No hay tareas con este filtro.", "No tasks match this filter.")}</p>;
  return (
    <Table head={[t("Código", "Code"), t("Tarea", "Task"), t("Área", "Area"), ...(showFirm ? [t("Firma", "Firm")] : []), t("Paso", "Step"), t("Vence", "Due"), t("Estado", "Status"), t("Adj.", "Att."), t("Pendiente", "Pending"), ""]}>
      {groups.map(({ b, items }) => [
        <tr key={`h-${b.id}`} className="bg-muted/60">
          <td colSpan={showFirm ? 10 : 9} className="font-semibold">
            {b.name} <span className="font-normal text-muted-foreground">· {b.industry} · {t("día", "day")} {b.day ?? "—"} {t("de 180", "of 180")} · {items.filter(isOpen).length} {t("abiertas", "open")}</span>
          </td>
        </tr>,
        ...items.map((task) => (
          <tr key={task.id} className="align-top hover:bg-muted/40">
            <td className="whitespace-nowrap font-display text-xs font-semibold">{task.code}</td>
            <td className="min-w-[220px]"><TaskLink task={task} viewer={viewer} className="font-medium hover:text-primary hover:underline">{task.name}</TaskLink></td>
            <td className="whitespace-nowrap text-xs">{areaLabel(task.area, lang)}</td>
            {showFirm && <td><FirmPill firmId={task.firm} /></td>}
            <td><StepCell task={task} /></td>
            <td><DueText task={task} /></td>
            <td><TaskStatusPill task={task} /></td>
            <td className="text-xs text-muted-foreground">{task.attachments.length > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" />{task.attachments.length}</span>}</td>
            <td><Signals task={task} /></td>
            <td className="text-right"><RowAction task={task} viewer={viewer} /></td>
          </tr>
        )),
      ])}
    </Table>
  );
}

const PARTY: Record<Party, { es: string; en: string; border: string }> = {
  firm: { es: "Firma", en: "Firm", border: "border-l-navy-mid" },
  owner: { es: "Dueño", en: "Owner", border: "border-l-gold" },
  sm: { es: "SM", en: "SM", border: "border-l-primary" },
};

// Task detail shared by the partner firm and SM. SM additionally reassigns the task and moves its due date.
export function TaskDetail({ task, viewer }: { task: Task; viewer: TaskViewer }) {
  const { t, lang } = useApp();
  const store = useTasks();
  const b = getBusiness(task.business)!;
  const firm = getFirm(task.firm);
  const who = viewer === "partner" ? firm?.contact ?? "—" : SM_USER;
  const party: Party = viewer === "partner" ? "firm" : "sm";
  // SM only delivers on tasks its own internal team executes; external firms deliver their own work.
  const canWork = viewer === "partner" || !!firm?.internal;
  const action = nextAction(task);

  const [note, setNote] = useState("");
  const [file, setFile] = useState("");
  const [reply, setReply] = useState("");
  const [ask, setAsk] = useState("");
  const [when, setWhen] = useState(task.meeting?.at ?? "");
  const [firmId, setFirmId] = useState(task.firm ?? "");
  const [due, setDue] = useState(task.due);

  const deliver = () => {
    store.deliver(task.id, note.trim(), file || undefined);
    setNote(""); setFile("");
    toast.success(action === "redeliver" ? t("Reentregada. El dueño la vuelve a revisar.", "Redelivered. The owner reviews it again.") : t("Entregada. El dueño revisa contra el criterio de aceptación.", "Delivered. The owner reviews it against the acceptance criterion."));
  };
  const send = () => { if (!reply.trim()) return; store.say(task.id, who, party, reply.trim()); setReply(""); };
  const addAsk = () => { if (!ask.trim()) return; store.addRequest(task.id, ask.trim()); setAsk(""); toast.success(t("Pedido enviado al dueño", "Request sent to the owner")); };
  const propose = () => {
    if (!when) { toast.error(t("Elegí fecha y hora", "Pick a date and time")); return; }
    store.proposeMeeting(task.id, when);
    toast.success(t("Reunión propuesta. Queda pendiente hasta que el dueño la confirme.", "Meeting proposed. Pending until the owner confirms."));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="navy" fit dot={false}>{task.code}</Pill>
            <h2 className="text-xl font-semibold">{task.name}</h2>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {b.name} · {areaLabel(task.area, lang)} · {firm?.name ?? t("En manos de tercero", "With a third party")} · {t("Responsable", "Responsible")}: {task.responsible}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="text-right"><div className="eyebrow">{t("Fecha límite", "Due date")}</div><DueText task={task} block /></div>
          <TaskStatusPill task={task} />
        </div>
      </div>

      <section className="panel border-l-4 border-l-gold px-4 py-3">
        <div className="eyebrow">{t("Criterio de aceptación", "Acceptance criterion")}</div>
        <p className="mt-1 text-[15px] leading-relaxed">{task.acceptance}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t(`Es lo que ${b.owner} revisa antes de aceptar la entrega.`, `This is what ${b.owner} checks before accepting the delivery.`)}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Panel title={t("Entrega", "Delivery")} action={<span className="num text-xs text-muted-foreground">{task.attachments.length} {t("adjuntos", "attachments")}</span>}>
            {task.status === "changes" && task.changesNote && (
              <blockquote className="mb-3 rounded-sm border border-danger/60 bg-danger/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-danger"><Quote className="h-3.5 w-3.5" />{t(`Cambios pedidos por ${b.owner}`, `Changes requested by ${b.owner}`)}</div>
                <p className="mt-1 text-sm">“{task.changesNote}”</p>
              </blockquote>
            )}
            {task.attachments.length > 0 ? (
              <ul className="divide-y rounded-sm border">
                {task.attachments.map((f) => <li key={f} className="flex items-center gap-2 px-3 py-1.5 text-sm"><Paperclip className="h-3.5 w-3.5 text-muted-foreground" />{f}</li>)}
              </ul>
            ) : <p className="text-sm text-muted-foreground">{t("Sin adjuntos todavía.", "No attachments yet.")}</p>}
            {task.deliveryNote && <div className="mt-3 rounded-sm border bg-muted px-3 py-2 text-sm"><span className="eyebrow mr-2">{t("Nota de entrega", "Delivery note")}</span>{task.deliveryNote}</div>}

            {waitingOwner(task) && <p className="mt-3 text-sm text-muted-foreground">{t(`Entregada el ${fdate(lastDelivery(task) ?? task.due, "es")}. Esperando que ${b.owner} acepte o pida cambios.`, `Delivered on ${fdate(lastDelivery(task) ?? task.due, "en")}. Waiting for ${b.owner} to accept or request changes.`)}</p>}
            {task.status === "accepted" && <p className="mt-3 flex items-center gap-1.5 text-sm text-success"><Check className="h-4 w-4" />{t("Aceptada por el dueño.", "Accepted by the owner.")}</p>}
            {task.status === "third" && <p className="mt-3 text-sm text-muted-foreground">{t("La ejecuta un tercero fuera de la red. SM hace el seguimiento en la fecha indicada.", "Run by a third party outside the network. SM follows up on the date shown.")}</p>}

            {canWork && action === "start" && (
              <div className="mt-3"><Btn onClick={() => { store.start(task.id); toast.success(t("Tarea en proceso", "Task in progress")); }}>{t("Empezar", "Start")}</Btn></div>
            )}
            {canWork && (action === "deliver" || action === "redeliver") && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={action === "redeliver" ? t("Qué cambiaste respecto de la entrega anterior", "What changed since the previous delivery") : t("Nota para el dueño: qué entregás y dónde mirar", "Note for the owner: what you deliver and where to look")} className="h-20 w-full rounded-sm border bg-background p-2 text-sm" />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-input bg-card px-3 font-display text-sm font-semibold hover:border-navy-mid hover:bg-muted">
                    <Paperclip className="h-3.5 w-3.5" />{t("Adjuntar", "Attach")}
                    <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
                  </label>
                  <span className="text-xs text-muted-foreground">{file || `${task.code}_v${task.attachments.length + 1}.pdf`}</span>
                  <Btn className="ml-auto" variant={action === "redeliver" ? "gold" : "primary"} onClick={deliver}>{action === "redeliver" ? t("Reentregar", "Redeliver") : t("Entregar", "Deliver")}</Btn>
                </div>
              </div>
            )}
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{t("Conversación", "Conversation")}</span>} action={<span className="text-xs text-muted-foreground">{t("Firma, dueño y SM", "Firm, owner and SM")}</span>}>
            {task.thread.length === 0 ? <p className="text-sm text-muted-foreground">{t("Nadie escribió todavía.", "No one has written yet.")}</p> : (
              <ul className="space-y-3">
                {task.thread.map((m, i) => (
                  <li key={i} className={cn("border-l-2 pl-3", PARTY[m.party].border)}>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.from}</span>
                      <Pill tone={m.party === "owner" ? "gold" : m.party === "sm" ? "navy" : "grey"} fit dot={false}>{PARTY[m.party][lang]}</Pill>
                      <span className="num">{fdate(m.at, lang)}</span>
                    </div>
                    <p className="mt-0.5 text-sm">{m.text}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex gap-2 border-t pt-3">
              <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("Escribir al dueño y a SM…", "Write to the owner and SM…")} className="h-8 flex-1 rounded-sm border bg-background px-2 text-sm" />
              <Btn variant="outline" onClick={send}>{t("Enviar", "Send")}</Btn>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t("Lo que necesito del dueño", "What I need from the owner")} action={<span className="num text-xs text-muted-foreground">{openRequests(task).length} {t("abiertos", "open")}</span>}>
            {task.requests.length === 0 ? <p className="text-sm text-muted-foreground">{t("Nada pedido.", "Nothing requested.")}</p> : (
              <ul className="divide-y">
                {[...task.requests].sort((a, z) => Number(a.resolved) - Number(z.resolved) || a.at.localeCompare(z.at)).map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-2 py-2">
                    <div>
                      <div className={cn("text-sm", r.resolved && "text-muted-foreground line-through")}>{r.text}</div>
                      <div className="num text-xs text-muted-foreground">{t("Pedido el", "Requested on")} {fdate(r.at, lang)}</div>
                    </div>
                    {r.resolved ? <Pill tone="green" fit>{t("Resuelto", "Resolved")}</Pill>
                      : <Btn variant="ghost" className="h-7 px-2 text-xs" onClick={() => store.resolveRequest(task.id, r.id)}>{t("Resuelto", "Resolved")}</Btn>}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex gap-2 border-t pt-3">
              <input value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAsk()} placeholder={t("Qué necesitás del dueño", "What you need from the owner")} className="h-8 min-w-0 flex-1 rounded-sm border bg-background px-2 text-sm" />
              <Btn variant="outline" onClick={addAsk}><Plus className="h-3.5 w-3.5" />{t("Pedir", "Ask")}</Btn>
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4" />{t("Reunión", "Meeting")}</span>}>
            {task.meeting ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="num">{meetingWhen(task.meeting.at, lang)}</span>
                <Pill tone={task.meeting.status === "proposed" ? "amber" : "green"} fit>{task.meeting.status === "proposed" ? t("Propuesta", "Proposed") : t("Confirmada", "Confirmed")}</Pill>
              </div>
            ) : <p className="text-sm text-muted-foreground">{t("Sin reunión.", "No meeting.")}</p>}
            <div className="mt-3 flex gap-2 border-t pt-3">
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-8 min-w-0 flex-1 rounded-sm border bg-background px-2 text-sm" />
              <Btn variant="outline" onClick={propose}>{t("Proponer", "Propose")}</Btn>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("Queda propuesta hasta que el dueño la confirme. Aparece en el calendario de los dos.", "It stays proposed until the owner confirms. It shows on both calendars.")}</p>
          </Panel>

          <Panel title={t("Paso del método", "Method step")}>
            <ol className="space-y-1 text-sm">
              {PROGRAM.steps.map((s, i) => (
                <li key={i} className={cn("flex items-center gap-2", i === task.step && task.status !== "accepted" ? "font-semibold" : "text-muted-foreground")}>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-sm border text-[11px]", i < task.step || task.status === "accepted" ? "border-success bg-success text-white dark:text-navy-deep" : i === task.step ? "border-gold-dark bg-gold text-gold-foreground" : "border-input/70 bg-muted")}>
                    {i < task.step || task.status === "accepted" ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {s[lang]}
                </li>
              ))}
            </ol>
          </Panel>

          {viewer === "sm" && (
            <Panel title={t("Gestión SM", "SM controls")}>
              <div className="space-y-3 text-sm">
                <label className="grid gap-1">
                  <span className="eyebrow">{t("Firma que ejecuta", "Executing firm")}</span>
                  <div className="flex gap-2">
                    <select value={firmId} onChange={(e) => setFirmId(e.target.value)} className="h-8 min-w-0 flex-1 rounded-sm border bg-card px-2 text-sm">
                      {FIRMS.map((f) => <option key={f.id} value={f.id}>{f.name} · {areaLabel(f.area, lang)}</option>)}
                    </select>
                    <Btn variant="outline" onClick={() => { if (!firmId || firmId === task.firm) return; store.reassign(task.id, firmId); toast.success(t("Tarea reasignada", "Task reassigned")); }}>{t("Reasignar", "Reassign")}</Btn>
                  </div>
                </label>
                <label className="grid gap-1">
                  <span className="eyebrow">{t("Fecha límite", "Due date")}</span>
                  <div className="flex gap-2">
                    <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-8 min-w-0 flex-1 rounded-sm border bg-background px-2 text-sm" />
                    <Btn variant="outline" onClick={() => { if (!due || due === task.due) return; store.setDue(task.id, due); toast.success(t("Fecha cambiada", "Due date changed")); }}>{t("Cambiar", "Change")}</Btn>
                  </div>
                </label>
              </div>
            </Panel>
          )}

          <Panel title={t("Historial", "History")}>
            <ol className="space-y-2">
              {[...task.history].reverse().map((h, i) => (
                <li key={i} className="text-sm">
                  <div className="flex justify-between gap-2"><span>{h[lang]}</span><span className="num text-xs text-muted-foreground">{fdate(h.at, lang)}</span></div>
                  {h.note && <div className="mt-0.5 border-l-2 border-l-input pl-2 text-xs text-muted-foreground">“{h.note}”</div>}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
