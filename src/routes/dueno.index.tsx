import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD, PROGRAM, TODAY } from "@/lib/config";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { contracts, deliverables, documents, events, getBusiness, manualSections, team, WEEK, WEEK_EN, type Business } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import { daysBetween, firmShortName, getFirm, openRequests, waitingOwner, type Task } from "@/lib/tasks";
import { FranchisorHome } from "@/components/sm/franchisor-home";
import { AreaCard, ProgramHeader } from "@/components/sm/program";
import { Bar, Btn, Panel, Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/dueno/")({
  head: pageHead("Mi programa", "Lo que ve el dueño del negocio durante el programa de 180 días."),
  component: OwnerProgram,
});

type Todo = { id: string; es: string; en: string; kind: "upload" | "approve" | "task" | "review" | "sign"; due?: string; area?: string };

function OwnerProgram() {
  const { ownerBusiness } = useApp();
  const b = getBusiness(ownerBusiness)!;
  // A small business that already franchised gets the franchisor home instead of the program view.
  return b.stage === "franchisor" ? <FranchisorHome b={b} /> : <ProgramView b={b} />;
}

function ProgramView({ b }: { b: Business }) {
  const { t, lang } = useApp();
  const { tasks } = useTasks();
  const consultant = team.find((m) => m.name === b.consultant);
  const week = lang === "es" ? WEEK : WEEK_EN;

  // Deliveries waiting for the owner's verdict come live from the task store, so accepting one
  // in the area detail clears it here too.
  const reviews: Todo[] = tasks.filter((x) => x.business === b.id && waitingOwner(x))
    .map((x) => ({ id: `r-${x.id}`, es: `Aceptar o pedir cambios: ${x.name}`, en: `Accept or request changes: ${x.name}`, kind: "review" as const, area: x.area }));
  // The rest of the owner's to-dos: signatures, documents and manual sections.
  const initial: Todo[] = [
    ...contracts.filter((c) => c.business === b.id && c.state === "sent").map((c) => ({ id: c.id, es: `Firmar ${c.name} (DocuSeal)`, en: `Sign ${c.name} (DocuSeal)`, kind: "sign" as const, due: c.date, area: c.area })),
    ...documents.filter((d) => d.business === b.id && d.state === "requested").map((d) => ({ id: d.id, es: `Subir ${d.name}`, en: `Upload ${d.name}`, kind: "upload" as const, due: d.date })),
    ...deliverables.filter((d) => d.business === b.id && d.status === "owner").map((d) => ({ id: d.id, es: d.name, en: d.name, kind: "task" as const, due: d.due, area: d.area })),
    ...manualSections(b.id).filter((s) => !s.approved && s.pct >= 50).map((s) => ({ id: `m-${s.id}`, es: `Revisar y aprobar "${s.name}" del manual`, en: `Review and approve "${s.name}" in the manual`, kind: "approve" as const })),
  ];
  const [rest, setRest] = useState(initial);
  const todos = [...reviews, ...rest];
  const done = (todo: Todo) => {
    setRest(rest.filter((x) => x.id !== todo.id));
    toast.success(todo.kind === "upload" ? t("Documento subido. SM lo va a revisar.", "Document uploaded. SM will review it.") : todo.kind === "approve" ? t("Sección aprobada", "Section approved") : t("Listo, avisamos a tu consultor", "Done, your consultant was notified"));
  };
  const meetings = events.filter((e) => e.business === b.id && e.kind === "meeting");
  const taskMeetings = tasks.filter((x) => x.business === b.id && x.meeting?.status === "confirmed" && x.meeting.at.slice(0, 10) >= TODAY)
    .sort((a, z) => (a.meeting?.at ?? "").localeCompare(z.meeting?.at ?? ""));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{b.name}</h2>
          <div className="text-sm text-muted-foreground">
            {t("Tu consultor principal", "Your lead consultant")}: {b.consultant}{consultant && <> · <a className="text-primary hover:underline" href={`mailto:${consultant.email}`}>{consultant.email}</a></>}
          </div>
        </div>
        <Pill tone="gold" fit>{t("Small Business en programa · día", "Small Business in program · day")} {b.day} {t("de 180", "of 180")}</Pill>
      </div>

      <AsksPanel b={b} />

      <ProgramHeader b={b} renderArea={(a, node) => a.skipped ? node : <Link to="/dueno/area/$area" params={{ area: a.area }} className="block">{node}</Link>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title={t("Te toca a vos", "Your turn")} action={<Pill tone={todos.length ? "amber" : "green"}>{todos.length} {t("pendientes", "pending")}</Pill>}>
          {todos.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />{t("Nada pendiente de tu lado. SM está trabajando.", "Nothing pending on your side. SM is working.")}</p>
          ) : (
            <ul className="divide-y">
              {todos.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{lang === "es" ? x.es : x.en}</div>
                    {x.due && <div className="text-xs text-muted-foreground">{x.kind === "upload" ? t("Pedido el", "Requested on") : t("Vence", "Due")} {fdate(x.due, lang)}</div>}
                  </div>
                  {x.kind === "upload" ? <Btn variant="outline" onClick={() => done(x)}><Upload className="h-3.5 w-3.5" />{t("Subir", "Upload")}</Btn>
                    : x.kind === "approve" ? <Link to="/dueno/manual"><Btn variant="gold">{t("Revisar", "Review")}</Btn></Link>
                    : x.kind === "review" && x.area ? <Link to="/dueno/area/$area" params={{ area: x.area }}><Btn variant="gold">{t("Revisar", "Review")}</Btn></Link>
                    : x.kind === "sign" && x.area && PROGRAM.areas.some((p) => p.id === x.area) ? <Link to="/dueno/area/$area" params={{ area: x.area }}><Btn variant="gold">{t("Firmar", "Sign")}</Btn></Link>
                    : x.kind === "sign" ? <Btn variant="gold" onClick={() => done(x)}>{t("Firmar", "Sign")}</Btn>
                    : <Btn variant="outline" onClick={() => done(x)}>{t("Marcar hecho", "Mark done")}</Btn>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="space-y-4">
          <Panel title={t("Próximas reuniones", "Upcoming meetings")} action={<Link to="/calendario" className="text-xs text-primary hover:underline">{t("Calendario", "Calendar")}</Link>}>
            <ul className="divide-y">
              {taskMeetings.map((x) => (
                <li key={x.id} className="py-2 text-sm">
                  <div className="flex items-center gap-1.5 font-medium"><Video className="h-3.5 w-3.5 text-primary" />{x.name}</div>
                  <div className="num text-xs text-muted-foreground">{fdate(x.meeting!.at.slice(0, 10), lang)} · {x.meeting!.at.slice(11, 16)} · {getFirm(x.firm)?.name ?? "SM"}</div>
                </li>
              ))}
              {meetings.map((e) => (
                <li key={e.id} className="py-2 text-sm">
                  <div className="flex items-center gap-1.5 font-medium">{e.meet && <Video className="h-3.5 w-3.5 text-primary" />}{e.title}</div>
                  <div className="num text-xs text-muted-foreground">{week[e.day]} oct · {String(Math.floor(e.start)).padStart(2, "0")}:{e.start % 1 ? "30" : "00"} · {team.find((m) => m.id === e.member)?.name ?? "SM"}</div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("Tu semáforo", "Your readiness")}>
            <div className="num font-display text-3xl font-semibold">{b.franchisability}%</div>
            <Bar value={b.franchisability ?? 0} tone="gold" className="mt-2 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {t(`Cuando llegues a ${FRANCHISABILITY_THRESHOLD}%, SM te presenta a un Business Bishop. Hoy lo que más suma: terminar el manual y resolver la marca.`, `At ${FRANCHISABILITY_THRESHOLD}% SM introduces you to a Business Bishop. What moves the needle today: finish the manual and settle the brand.`)}
            </p>
          </Panel>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-display font-semibold">{t("Cómo va cada área", "How each area is going")}</h3>
          <span className="text-xs text-muted-foreground">{t("Relevar · Diseñar · Implementar · Validar · Documentar", "Survey · Design · Implement · Validate · Document")}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(b.areas ?? []).map((a) => a.skipped ? <AreaCard key={a.area} a={a} /> : (
            <Link key={a.area} to="/dueno/area/$area" params={{ area: a.area }} className="block"><AreaCard a={a} clickable /></Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// "Te piden": every open request from every firm working on this business, oldest first, plus the
// meetings firms proposed. It is the first thing the owner sees on the program home.
function AsksPanel({ b }: { b: Business }) {
  const { t, lang } = useApp();
  const store = useTasks();
  const mine = store.tasks.filter((x) => x.business === b.id);
  const asks = mine.flatMap((x) => openRequests(x).map((r) => ({ r, x }))).sort((a, z) => a.r.at.localeCompare(z.r.at));
  const proposed = mine.filter((x) => x.meeting?.status === "proposed").sort((a, z) => (a.meeting?.at ?? "").localeCompare(z.meeting?.at ?? ""));
  const total = asks.length + proposed.length;
  const who = (x: Task) => firmShortName(x.firm) ?? "SM";

  return (
    <Panel title={t("Te piden", "Asked of you")} action={<Pill tone={total ? "amber" : "green"}>{total} {t("abiertos", "open")}</Pill>}>
      {total === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />{t("Ninguna firma está esperando algo de vos.", "No firm is waiting on you.")}</p>
      ) : (
        <ul className="divide-y">
          {asks.map(({ r, x }) => {
            const age = daysBetween(r.at, TODAY);
            return (
              <li key={`${x.id}-${r.id}`} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{r.text}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{who(x)}</span> · {x.code} {x.name} · <span className={age > 7 ? "text-danger" : undefined}>{t("pedido el", "asked on")} {fdate(r.at, lang)}{age > 0 ? t(` (hace ${age} d)`, ` (${age} d ago)`) : ""}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="outline" onClick={() => { store.resolveRequest(x.id, r.id); toast.success(t(`Listo. ${who(x)} lo ve resuelto.`, `Done. ${who(x)} sees it resolved.`)); }}>{t("Listo", "Done")}</Btn>
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-primary bg-primary px-3 font-display text-sm font-semibold text-primary-foreground hover:border-navy-deep hover:bg-navy-deep dark:hover:bg-primary/90">
                    <Upload className="h-3.5 w-3.5" />{t("Subir", "Upload")}
                    <input type="file" className="sr-only" onChange={(e) => {
                      const file = e.target.files?.[0]?.name;
                      if (!file) return;
                      store.resolveRequest(x.id, r.id, { who: b.owner, file });
                      toast.success(t(`${file} subido. ${who(x)} lo recibe en la tarea.`, `${file} uploaded. ${who(x)} gets it in the task.`));
                    }} />
                  </label>
                </div>
              </li>
            );
          })}
          {proposed.map((x) => <MeetingRow key={x.id} x={x} owner={b.owner} firm={who(x)} />)}
        </ul>
      )}
    </Panel>
  );
}

function MeetingRow({ x, owner, firm }: { x: Task; owner: string; firm: string }) {
  const { t, lang } = useApp();
  const { confirmMeeting } = useTasks();
  const [editing, setEditing] = useState(false);
  const [at, setAt] = useState(x.meeting?.at ?? "");
  if (!x.meeting) return null;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium"><Video className="h-3.5 w-3.5 text-primary" />{t("Reunión propuesta", "Proposed meeting")}: <span className="num">{fdate(x.meeting.at.slice(0, 10), lang)} · {x.meeting.at.slice(11, 16)}</span></div>
        <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{firm}</span> · {x.code} {x.name}</div>
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className="h-8 rounded-sm border bg-background px-2 text-sm" />
          <Btn onClick={() => { if (!at) return; confirmMeeting(x.id, owner, at); setEditing(false); toast.success(t("Nueva fecha confirmada. La firma la ve en el hilo.", "New time confirmed. The firm sees it in the thread.")); }}>{t("Guardar", "Save")}</Btn>
          <Btn variant="ghost" onClick={() => setEditing(false)}>{t("Cancelar", "Cancel")}</Btn>
        </div>
      ) : (
        <div className="flex gap-2">
          <Btn variant="gold" onClick={() => { confirmMeeting(x.id, owner); toast.success(t("Reunión confirmada", "Meeting confirmed")); }}>{t("Confirmar", "Confirm")}</Btn>
          <Btn variant="outline" onClick={() => setEditing(true)}>{t("Cambiar fecha", "Change time")}</Btn>
        </div>
      )}
    </li>
  );
}