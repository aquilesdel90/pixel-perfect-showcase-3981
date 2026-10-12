import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { getBusiness } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import { isOpen, isOverdue, openRequests, waitingOwner, type Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/firma/clientes")({
  head: pageHead("Mis clientes", "Negocios donde la firma aliada tiene tareas."),
  component: PartnerClients,
});

// Same visibility rule as "Mis tareas": the card only summarizes the firm's own tasks for each business.
// Name, industry and program day are the only business facts a firm gets; no numbers, manual or documents.
function PartnerClients() {
  const { t, partnerFirm } = useApp();
  const { tasks } = useTasks();
  const mine = tasks.filter((x) => x.firm === partnerFirm);
  const ids = [...new Set(mine.map((x) => x.business))];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("Un negocio por tarjeta. Click para ver solo sus tareas.", "One business per card. Click to see only its tasks.")}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ids.map((id) => <ClientCard key={id} id={id} tasks={mine.filter((x) => x.business === id)} />)}
      </div>
    </div>
  );
}

function ClientCard({ id, tasks }: { id: string; tasks: Task[] }) {
  const { t, lang } = useApp();
  const b = getBusiness(id)!;
  const open = tasks.filter(isOpen);
  const overdue = tasks.filter(isOverdue);
  const accepted = tasks.filter((x) => x.status === "accepted").length;
  const next = open.filter((x) => !waitingOwner(x)).sort((a, z) => a.due.localeCompare(z.due))[0];
  const stuck = blocker(tasks, lang);
  return (
    <Link to="/firma" search={{ negocio: id }} className="panel group block p-4 transition-colors hover:border-primary/60">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold">{b.name}</div>
          <div className="text-xs text-muted-foreground">{b.industry} · {t("día", "day")} {b.day ?? "—"} {t("de 180", "of 180")}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
      </div>
      <dl className="num mt-3 grid grid-cols-3 border-y py-2 text-center">
        <div><dt className="eyebrow">{t("Abiertas", "Open")}</dt><dd className="font-display text-lg font-semibold">{open.length}</dd></div>
        <div className="border-x"><dt className="eyebrow">{t("Vencidas", "Overdue")}</dt><dd className={cn("font-display text-lg font-semibold", overdue.length > 0 && "text-danger")}>{overdue.length}</dd></div>
        <div><dt className="eyebrow">{t("Aceptadas", "Accepted")}</dt><dd className="font-display text-lg font-semibold text-success">{accepted}</dd></div>
      </dl>
      <div className="mt-2 text-xs"><span className="text-muted-foreground">{t("Próxima fecha límite", "Next due date")}: </span>{next ? <span className="num">{fdate(next.due, lang)} · {next.code}</span> : "—"}</div>
      <div className={cn("mt-1 text-xs", stuck.tone === "red" ? "text-danger" : stuck.tone === "amber" ? "text-foreground" : "text-muted-foreground")}>
        <span className="text-muted-foreground">{t("Trabado", "Blocked")}: </span>{stuck.text}
      </div>
    </Link>
  );
}

// One line with the main thing holding the firm back in this business, most serious first.
function blocker(tasks: Task[], lang: "es" | "en"): { text: string; tone: "red" | "amber" | "grey" } {
  const asks = tasks.flatMap((x) => openRequests(x).map((r) => ({ r, x }))).sort((a, z) => a.r.at.localeCompare(z.r.at));
  const late = tasks.filter(isOverdue).sort((a, z) => a.due.localeCompare(z.due));
  const first = asks[0];
  if (first) {
    const more = asks.length > 1 ? (lang === "es" ? ` y ${asks.length - 1} pedido(s) más` : ` and ${asks.length - 1} more request(s)`) : "";
    return { text: `${lang === "es" ? "Esperando del dueño" : "Waiting on the owner"}: ${first.r.text} (${first.x.code}, ${fdate(first.r.at, lang)})${more}`, tone: "amber" };
  }
  const l = late[0];
  if (l) return { text: `${l.code} ${l.name} ${lang === "es" ? "vencida" : "overdue"}`, tone: "red" };
  return { text: lang === "es" ? "Nada trabado" : "Nothing blocked", tone: "grey" };
}
