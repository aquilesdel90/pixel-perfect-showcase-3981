import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { CURRENT, FRANCHISABILITY_THRESHOLD, PROGRAM } from "@/lib/config";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { contracts, deliverables, documents, events, getBusiness, manualSections, team, WEEK, WEEK_EN } from "@/lib/mock-data";
import { AreaCard, ProgramHeader } from "@/components/sm/program";
import { Bar, Btn, Panel, Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/dueno/")({
  head: pageHead("Mi programa", "Lo que ve el dueño del negocio durante el programa de 180 días."),
  component: OwnerProgram,
});

type Todo = { id: string; es: string; en: string; kind: "upload" | "approve" | "task" | "review" | "sign"; due?: string; area?: string };

function OwnerProgram() {
  const { t, lang, reviews } = useApp();
  const b = getBusiness(CURRENT.ownerBusiness)!;
  const consultant = team.find((m) => m.name === b.consultant);
  const week = lang === "es" ? WEEK : WEEK_EN;

  // Everything the owner has to do, gathered from deliverables, documents and manual sections.
  const initial: Todo[] = [
    ...deliverables.filter((d) => d.business === b.id && d.status === "delivered" && (reviews[d.id]?.review ?? d.review) === "pending").map((d) => ({ id: `r-${d.id}`, es: `Aceptar o pedir cambios: ${d.name}`, en: `Accept or request changes: ${d.name}`, kind: "review" as const, area: d.area })),
    ...contracts.filter((c) => c.business === b.id && c.state === "sent").map((c) => ({ id: c.id, es: `Firmar ${c.name} (DocuSeal)`, en: `Sign ${c.name} (DocuSeal)`, kind: "sign" as const, due: c.date, area: c.area })),
    ...documents.filter((d) => d.business === b.id && d.state === "requested").map((d) => ({ id: d.id, es: `Subir ${d.name}`, en: `Upload ${d.name}`, kind: "upload" as const, due: d.date })),
    ...deliverables.filter((d) => d.business === b.id && d.status === "owner").map((d) => ({ id: d.id, es: d.name, en: d.name, kind: "task" as const, due: d.due, area: d.area })),
    ...manualSections(b.id).filter((s) => !s.approved && s.pct >= 50).map((s) => ({ id: `m-${s.id}`, es: `Revisar y aprobar "${s.name}" del manual`, en: `Review and approve "${s.name}" in the manual`, kind: "approve" as const })),
  ];
  const [todos, setTodos] = useState(initial);
  const done = (todo: Todo) => {
    setTodos(todos.filter((x) => x.id !== todo.id));
    toast.success(todo.kind === "upload" ? t("Documento subido. SM lo va a revisar.", "Document uploaded. SM will review it.") : todo.kind === "approve" ? t("Sección aprobada", "Section approved") : t("Listo, avisamos a tu consultor", "Done, your consultant was notified"));
  };
  const meetings = events.filter((e) => e.business === b.id && e.kind === "meeting");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{b.name}</h2>
          <div className="text-sm text-muted-foreground">
            {t("Tu consultor principal", "Your lead consultant")}: {b.consultant}{consultant && <> · <a className="text-primary hover:underline" href={`mailto:${consultant.email}`}>{consultant.email}</a></>}
          </div>
        </div>
        <Pill tone="gold">{t("Día", "Day")} {b.day} {t("de 180", "of 180")}</Pill>
      </div>

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(b.areas ?? []).map((a) => a.skipped ? <AreaCard key={a.area} a={a} /> : (
            <Link key={a.area} to="/dueno/area/$area" params={{ area: a.area }} className="block"><AreaCard a={a} clickable /></Link>
          ))}
        </div>
      </div>
    </div>
  );
}
