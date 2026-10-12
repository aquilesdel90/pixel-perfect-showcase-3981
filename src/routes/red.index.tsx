import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { PROGRAM, TODAY } from "@/lib/config";
import { pageHead } from "@/lib/head";
import { getBusiness } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import {
  addDays, avgLateDays, dueThisWeek, FIRMS, isOpen, isOverdue, lastDelivery, programBusinesses, shownStatus, STATUS_LABEL,
  waitingOwner, type Task, type TaskStatus,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { areaLabel, DueText, FirmPill, SmTaskTabs, StepCell, TaskStatusPill } from "@/components/sm/tasks";
import { Panel, Pill, Stat, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/red/")({
  head: pageHead("Tareas de la red", "Todo lo que hacen todas las firmas aliadas en todos los negocios del programa."),
  component: NetworkTasks,
});

// Monday of the current week, so "delivered this week" means since Monday.
const WEEK_START = addDays(TODAY, -((new Date(`${TODAY}T12:00:00Z`).getUTCDay() + 6) % 7));

type Tone = "red" | "amber" | "green" | "grey";
const CELL: Record<Tone, string> = {
  red: "border-danger/70 bg-danger/10 hover:border-danger",
  amber: "border-warning/80 bg-warning/15 hover:border-warning",
  green: "border-success/70 bg-success/10 hover:border-success",
  grey: "border-dashed border-input/70 bg-muted text-muted-foreground",
};

function NetworkTasks() {
  const { t } = useApp();
  const { tasks } = useTasks();
  const overdue = tasks.filter(isOverdue).length;
  const deliveredThisWeek = tasks.filter((x) => (lastDelivery(x) ?? "") >= WEEK_START).length;
  return (
    <div className="space-y-4">
      <SmTaskTabs active="network" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Tareas abiertas", "Open tasks")} value={tasks.filter(isOpen).length} tone="navy" />
        <Stat label={t("Vencidas", "Overdue")} value={overdue} {...(overdue > 0 ? { tone: "red" as const } : {})} />
        <Stat label={t("Esperando al dueño", "Waiting for the owner")} value={tasks.filter(waitingOwner).length} tone="amber" />
        <Stat label={t("Entregadas esta semana", "Delivered this week")} value={deliveredThisWeek} tone="green" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Matrix tasks={tasks} />
        <FirmLoad tasks={tasks} />
      </div>
      <TaskTable tasks={tasks} />
    </div>
  );
}

// Businesses x areas. Each cell: open / overdue, colored by the worst thing in it. Click opens the area detail.
function Matrix({ tasks }: { tasks: Task[] }) {
  const { t, lang } = useApp();
  const bizs = programBusinesses();
  return (
    <Panel title={t("Negocios por área", "Businesses by area")} action={
      <div className="hidden flex-wrap gap-3 text-[11px] text-muted-foreground sm:flex">
        {([["red", t("Hay vencidas", "Overdue")], ["amber", t("Vence esta semana", "Due this week")], ["green", t("Al día", "On track")], ["grey", t("No aplica", "N/A")]] as const).map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1"><span className={cn("h-3 w-3 rounded-sm border", CELL[k])} />{l}</span>
        ))}
      </div>
    }>
      <div className="overflow-x-auto">
        <table className="num w-full min-w-[640px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="eyebrow px-1 text-left">{t("Negocio", "Business")}</th>
              {PROGRAM.areas.map((a) => <th key={a.id} className="eyebrow px-1 text-left">{a[lang]}</th>)}
            </tr>
          </thead>
          <tbody>
            {bizs.map((b) => (
              <tr key={b.id}>
                <td className="whitespace-nowrap pr-2"><div className="font-medium">{b.name}</div><div className="text-[11px] text-muted-foreground">{t("día", "day")} {b.day}</div></td>
                {PROGRAM.areas.map((a) => {
                  const cell = tasks.filter((x) => x.business === b.id && x.area === a.id);
                  const st = b.areas?.find((s) => s.area === a.id);
                  if (!st || st.skipped || cell.length === 0) {
                    return <td key={a.id}><div className={cn("rounded-sm border px-2 py-1.5 text-xs", CELL.grey)}>{t("No aplica", "N/A")}</div></td>;
                  }
                  const open = cell.filter(isOpen).length;
                  const late = cell.filter(isOverdue).length;
                  const tone: Tone = late > 0 ? "red" : cell.some(dueThisWeek) ? "amber" : "green";
                  return (
                    <td key={a.id}>
                      <Link to="/negocios/$id" params={{ id: b.id }} search={{ tab: "areas", area: a.id }} title={t(`${open} abiertas, ${late} vencidas`, `${open} open, ${late} overdue`)}
                        className={cn("block rounded-sm border px-2 py-1.5 transition-colors", CELL[tone])}>
                        <span className="font-display font-semibold">{open}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className={cn("font-display font-semibold", late > 0 && "text-danger")}>{late}</span>
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("Cada celda: abiertas / vencidas.", "Each cell: open / overdue.")}</p>
    </Panel>
  );
}

// Which provider is falling behind: open work, overdue work in red and average days late.
function FirmLoad({ tasks }: { tasks: Task[] }) {
  const { t, lang } = useApp();
  return (
    <Panel title={t("Carga por firma", "Load by firm")}>
      <Table head={[t("Firma", "Firm"), t("Tipo", "Type"), t("Abiertas", "Open"), t("Vencidas", "Overdue"), t("Atraso prom.", "Avg. late")]} right={[2, 3, 4]}>
        {FIRMS.map((f) => {
          const mine = tasks.filter((x) => x.firm === f.id);
          const late = mine.filter(isOverdue).length;
          const avg = avgLateDays(mine);
          return (
            <tr key={f.id}>
              <td><div className="font-medium">{f.name}</div><div className="text-[11px] text-muted-foreground">{f.contact}</div></td>
              <td className="text-xs">{areaLabel(f.area, lang)}{f.internal && <div className="mt-0.5"><Pill tone="navy" fit dot={false}>{t("Interna", "Internal")}</Pill></div>}</td>
              <td className="text-right">{mine.filter(isOpen).length}</td>
              <td className={cn("text-right", late > 0 && "font-semibold text-danger")}>{late}</td>
              <td className={cn("text-right", avg > 0 && "text-danger")}>{avg > 0 ? t(`${avg} d`, `${avg} d`) : "—"}</td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}

const STATUSES = Object.keys(STATUS_LABEL) as TaskStatus[];

function TaskTable({ tasks }: { tasks: Task[] }) {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [firm, setFirm] = useState("");
  const [area, setArea] = useState("");
  const [biz, setBiz] = useState("");
  const [status, setStatus] = useState("open");
  const [who, setWho] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const people = [...new Set(tasks.map((x) => x.responsible))].sort();

  const rows = tasks
    .filter((x) => (!firm || x.firm === firm) && (!area || x.area === area) && (!biz || x.business === biz) && (!who || x.responsible === who)
      && (!status || (status === "open" ? isOpen(x) : shownStatus(x) === status)))
    .sort((a, z) => (order === "asc" ? a.due.localeCompare(z.due) : z.due.localeCompare(a.due)));

  const sel = "h-8 rounded-sm border bg-card px-2 text-sm";
  return (
    <Panel title={t("Todas las tareas", "All tasks")} action={<span className="num text-xs text-muted-foreground">{rows.length} {t("de", "of")} {tasks.length}</span>}>
      <div className="mb-3 flex flex-wrap gap-2">
        <select aria-label={t("Firma", "Firm")} value={firm} onChange={(e) => setFirm(e.target.value)} className={sel}>
          <option value="">{t("Todas las firmas", "All firms")}</option>
          {FIRMS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select aria-label={t("Área", "Area")} value={area} onChange={(e) => setArea(e.target.value)} className={sel}>
          <option value="">{t("Todas las áreas", "All areas")}</option>
          {PROGRAM.areas.map((a) => <option key={a.id} value={a.id}>{a[lang]}</option>)}
        </select>
        <select aria-label={t("Negocio", "Business")} value={biz} onChange={(e) => setBiz(e.target.value)} className={sel}>
          <option value="">{t("Todos los negocios", "All businesses")}</option>
          {programBusinesses().map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select aria-label={t("Estado", "Status")} value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
          <option value="">{t("Todos los estados", "All statuses")}</option>
          <option value="open">{t("Abiertas", "Open")}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s][lang]}</option>)}
        </select>
        <select aria-label={t("Responsable", "Responsible")} value={who} onChange={(e) => setWho(e.target.value)} className={sel}>
          <option value="">{t("Todos los responsables", "Everyone")}</option>
          {people.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select aria-label={t("Orden", "Order")} value={order} onChange={(e) => setOrder(e.target.value === "desc" ? "desc" : "asc")} className={cn(sel, "ml-auto")}>
          <option value="asc">{t("Fecha límite: más próxima primero", "Due date: soonest first")}</option>
          <option value="desc">{t("Fecha límite: más lejana primero", "Due date: latest first")}</option>
        </select>
      </div>
      <Table head={[t("Código", "Code"), t("Tarea", "Task"), t("Negocio", "Business"), t("Área", "Area"), t("Firma", "Firm"), t("Responsable", "Responsible"), t("Paso", "Step"), t("Vence", "Due"), t("Estado", "Status")]}>
        {rows.map((x) => (
          <tr key={x.id} className="cursor-pointer align-top hover:bg-muted/60" onClick={() => navigate({ to: "/red/tareas/$id", params: { id: x.id } })}>
            <td className="whitespace-nowrap font-display text-xs font-semibold">{x.code}</td>
            <td className="min-w-[200px] font-medium">{x.name}</td>
            <td className="whitespace-nowrap">{getBusiness(x.business)?.name}</td>
            <td className="whitespace-nowrap text-xs">{areaLabel(x.area, lang)}</td>
            <td><FirmPill firmId={x.firm} /></td>
            <td className="whitespace-nowrap text-xs">{x.responsible}</td>
            <td><StepCell task={x} /></td>
            <td><DueText task={x} /></td>
            <td><TaskStatusPill task={x} /></td>
          </tr>
        ))}
      </Table>
      {rows.length === 0 && <p className="mt-2 text-sm text-muted-foreground">{t("No hay tareas con este filtro.", "No tasks match this filter.")}</p>}
    </Panel>
  );
}
