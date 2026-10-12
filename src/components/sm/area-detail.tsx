import { Link } from "@tanstack/react-router";
import { CheckCircle2, FileSignature, MessageSquareWarning, Paperclip, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { PROGRAM, type AreaId } from "@/lib/config";
import { fdate } from "@/lib/format";
import { contracts, documents, type Business } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import { isOpen, waitingOwner, type Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { StepDots } from "./program";
import { DocPill } from "./status";
import { DueText, FirmPill, TaskStatusPill } from "./tasks";
import { Bar, Btn, Panel, Pill } from "./ui";

// Detail of one program area: what was done, what is in progress, what is pending,
// plus the documents and signatures that belong to it. Deliverables are the program tasks
// (src/lib/tasks.ts), each one showing the firm that executes it. The owner accepts or requests
// changes on every delivery; the owner's note lands in the task thread, where the firm reads it.
export function AreaDetail({ b, areaId, role }: { b: Business; areaId: AreaId; role: "sm" | "owner" }) {
  const { t, lang } = useApp();
  const store = useTasks();
  const area = PROGRAM.areas.find((a) => a.id === areaId)!;
  const state = b.areas?.find((a) => a.area === areaId);
  const [docs, setDocs] = useState(documents.filter((d) => d.business === b.id && d.area === areaId));
  const signs = contracts.filter((c) => c.business === b.id && c.area === areaId);

  if (!state) return <Panel><p className="text-sm text-muted-foreground">{t("Esta área no está en el programa.", "This area is not part of the program.")}</p></Panel>;
  if (state.skipped) {
    return (
      <Panel title={area[lang]}>
        <p className="text-sm text-muted-foreground">{t("No requerida en este programa.", "Not needed in this program.")} {state.skipReason}</p>
      </Panel>
    );
  }

  const items = store.tasks.filter((x) => x.business === b.id && x.area === areaId).sort((a, z) => a.due.localeCompare(z.due));
  const done = items.filter((x) => x.status === "accepted");
  const pending = items.filter((x) => x.status === "planned" || x.status === "third");
  const active = items.filter((x) => isOpen(x) && x.status !== "planned");
  const step = PROGRAM.steps[Math.min(state.step, 4)] ?? PROGRAM.steps[0];

  const accept = (x: Task) => { store.accept(x.id, b.owner); toast.success(t(`"${x.name}" aceptada`, `"${x.name}" accepted`)); };
  const rework = (x: Task, why: string) => { store.requestChanges(x.id, b.owner, why); toast.success(t("Pedido de cambios enviado. La firma lo lee en el hilo de la tarea.", "Change request sent. The firm reads it in the task thread.")); };

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">{area[lang]}</h3>
            <div className="text-sm text-muted-foreground">{t("Responsable", "Owner")}: {state.responsible} · {t("Días", "Days")} {area.start} {t("a", "to")} {area.end}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-40"><Bar value={state.progress} tone={state.step >= 4 ? "green" : "navy"} /></div>
            <span className="num font-display text-lg font-semibold">{state.progress}%</span>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="text-xs text-muted-foreground">{t("Paso actual", "Current step")}: <b className="text-foreground">{state.step >= 5 ? t("Completa", "Complete") : step[lang]}</b></div>
            <StepDots step={state.step} />
          </div>
          <div className="num flex gap-3 text-xs text-muted-foreground">
            <span><b className="text-success">{done.length}</b> {t("aceptadas", "accepted")}</span>
            <span><b className="text-primary">{active.length}</b> {t("en proceso", "in progress")}</span>
            <span><b>{pending.length}</b> {t("pendientes", "pending")}</span>
          </div>
        </div>
        <div className="mt-3 rounded-md border bg-muted px-3 py-2 text-xs"><span className="text-muted-foreground">{t("Se valida cuando", "Validated when")}: </span>{lang === "es" ? area.validate : area.validateEn}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Column title={t("Hecho", "Done")} tone="green" items={done} empty={t("Nada aceptado todavía", "Nothing accepted yet")}>
          {(x) => <Item x={x} role={role} />}
        </Column>
        <Column title={t("En proceso", "In progress")} tone="navy" items={active} empty={t("Nada en curso", "Nothing in progress")}>
          {(x) => (
            <Item x={x} role={role}>
              {waitingOwner(x) && role === "owner" && <ReviewBox onAccept={() => accept(x)} onRework={(why) => rework(x, why)} />}
            </Item>
          )}
        </Column>
        <Column title={t("Pendiente", "Pending")} tone="grey" items={pending} empty={t("Nada pendiente", "Nothing pending")}>
          {(x) => <Item x={x} role={role} />}
        </Column>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("Documentos de esta área", "Documents for this area")}>
          {docs.length === 0 ? <p className="text-sm text-muted-foreground">{t("Sin documentos pedidos.", "No documents requested.")}</p> : (
            <ul className="divide-y">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                  <div><div className="text-sm font-medium">{d.name}</div><div className="text-xs text-muted-foreground">{fdate(d.date, lang)}</div></div>
                  <div className="flex items-center gap-2">
                    <DocPill state={d.state} />
                    {role === "owner" && d.state === "requested" && <Btn variant="outline" onClick={() => { setDocs(docs.map((x) => x.id === d.id ? { ...x, state: "received" } : x)); toast.success(t("Documento subido", "Document uploaded")); }}><Upload className="h-3.5 w-3.5" />{t("Subir", "Upload")}</Btn>}
                    {role === "sm" && d.state === "received" && <Btn variant="outline" onClick={() => setDocs(docs.map((x) => x.id === d.id ? { ...x, state: "reviewed" } : x))}>{t("Marcar revisado", "Mark reviewed")}</Btn>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t("Firmas de esta área (DocuSeal)", "Signatures for this area (DocuSeal)")}>
          {signs.length === 0 ? <p className="text-sm text-muted-foreground">{t("Nada para firmar.", "Nothing to sign.")}</p> : (
            <ul className="divide-y">
              {signs.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                    <div><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.signers} · {fdate(c.date, lang)}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocPill state={c.state} />
                    {c.state === "sent" && role === "owner" && <Btn variant="gold" onClick={() => toast.info(t("Se abre DocuSeal en otra pestaña", "DocuSeal opens in a new tab"))}>{t("Firmar", "Sign")}</Btn>}
                    {c.state === "sent" && role === "sm" && <Btn variant="outline" onClick={() => toast.success(t("Recordatorio enviado", "Reminder sent"))}>{t("Recordar", "Remind")}</Btn>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Column({ title, tone, items, empty, children }: { title: string; tone: "green" | "navy" | "grey"; items: Task[]; empty: string; children: (x: Task) => React.ReactNode }) {
  const bar = { green: "bg-success", navy: "bg-primary", grey: "bg-muted-foreground/40" }[tone];
  return (
    <div className="rounded-md border bg-muted/50 p-2">
      <div className="flex items-center gap-2 px-1 pb-2"><span className={cn("h-2.5 w-2.5 rounded-sm", bar)} /><span className="text-sm font-semibold">{title}</span><span className="num ml-auto rounded-sm border bg-card px-1.5 text-xs">{items.length}</span></div>
      <div className="flex flex-col gap-2">
        {items.map((x) => <div key={x.id}>{children(x)}</div>)}
        {items.length === 0 && <div className="rounded-md border border-dashed py-5 text-center text-xs text-muted-foreground">{empty}</div>}
      </div>
    </div>
  );
}

// One deliverable card. SM opens the full task (with the thread); the owner reviews it right here.
function Item({ x, role, children }: { x: Task; role: "sm" | "owner"; children?: React.ReactNode }) {
  const { t } = useApp();
  return (
    <div className="rounded-md border bg-card p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-[11px] font-semibold text-muted-foreground">{x.code}</div>
          {role === "sm"
            ? <Link to="/red/tareas/$id" params={{ id: x.id }} className="font-medium hover:text-primary hover:underline">{x.name}</Link>
            : <div className="font-medium">{x.name}</div>}
        </div>
        <TaskStatusPill task={x} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <FirmPill firmId={x.firm} />
        <span>{x.responsible}</span>
        <span>{t("Vence", "Due")} <DueText task={x} /></span>
        {x.attachments.length > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" />{x.attachments.length}</span>}
      </div>
      {waitingOwner(x) && role === "sm" && <div className="mt-2"><Pill tone="amber">{t("Esperando al dueño", "Waiting for owner")}</Pill></div>}
      {x.status === "accepted" && <div className="mt-2 inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" />{t("Aceptada por el dueño", "Accepted by the owner")}</div>}
      {x.status === "changes" && (
        <div className="mt-2 rounded-md border border-warning/60 bg-warning/10 p-2 text-xs">
          <div className="flex items-center gap-1 font-semibold"><MessageSquareWarning className="h-3.5 w-3.5 text-warning" />{t("Cambios pedidos", "Changes requested")}</div>
          {x.changesNote && <div className="mt-1 text-muted-foreground">“{x.changesNote}”</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function ReviewBox({ onAccept, onRework }: { onAccept: () => void; onRework: (why: string) => void }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState("");
  return (
    <div className="mt-2">
      {!open ? (
        <div className="flex gap-2"><Btn variant="gold" onClick={onAccept}>{t("Aceptar", "Accept")}</Btn><Btn variant="outline" onClick={() => setOpen(true)}>{t("Pedir cambios", "Request changes")}</Btn></div>
      ) : (
        <div className="space-y-2">
          <textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder={t("Qué hay que cambiar y por qué", "What needs to change and why")} className="h-16 w-full rounded-md border bg-background p-2 text-xs" />
          <div className="flex gap-2">
            <Btn onClick={() => { if (!why.trim()) { toast.error(t("Escribí el motivo", "Write the reason")); return; } onRework(why.trim()); }}>{t("Enviar a la firma", "Send to the firm")}</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>{t("Cancelar", "Cancel")}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
