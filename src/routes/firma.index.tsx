import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { getBusiness } from "@/lib/mock-data";
import { useTasks } from "@/lib/task-store";
import { getFirm } from "@/lib/tasks";
import { areaLabel, TaskCounters, TaskList } from "@/components/sm/tasks";
import { Panel, Pill } from "@/components/sm/ui";

export const Route = createFileRoute("/firma/")({
  validateSearch: (s: Record<string, unknown>): { negocio?: string | undefined } => ({
    negocio: typeof s["negocio"] === "string" ? s["negocio"] : undefined,
  }),
  head: pageHead("Mis tareas", "Tareas de la firma aliada en todos los negocios del programa."),
  component: PartnerTasks,
});

// Visibility rule for partner firms: a firm only sees its own tasks, across every business it works for.
// From each business it sees nothing else: no numbers, no manual, no documents, no tasks of other firms.
// Everything on this page is derived from tasks filtered by firm; nothing else from the business is read.
function PartnerTasks() {
  const { t, lang, partnerFirm } = useApp();
  const { tasks } = useTasks();
  const { negocio } = Route.useSearch();
  const firm = getFirm(partnerFirm);
  const mine = tasks.filter((x) => x.firm === partnerFirm);
  const shown = negocio ? mine.filter((x) => x.business === negocio) : mine;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">{firm?.name ?? "—"}</h2>
          <div className="text-sm text-muted-foreground">{t("Firma aliada", "Partner firm")} · {firm ? areaLabel(firm.area, lang) : "—"} · {firm?.contact}</div>
        </div>
        {negocio && (
          <Link to="/firma" search={{}} className="inline-flex items-center gap-1.5">
            <Pill tone="navy" fit dot={false}>{getBusiness(negocio)?.name ?? negocio}<X className="ml-1 h-3 w-3" /></Pill>
            <span className="text-xs text-muted-foreground">{t("Quitar filtro", "Clear filter")}</span>
          </Link>
        )}
      </div>
      <TaskCounters tasks={shown} />
      <Panel title={t("Mis tareas por negocio", "My tasks by business")} action={<span className="num text-xs text-muted-foreground">{shown.length} {t("tareas", "tasks")}</span>}>
        <TaskList tasks={shown} viewer="partner" />
      </Panel>
    </div>
  );
}
