import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { useTasks } from "@/lib/task-store";
import { SM_USER } from "@/lib/tasks";
import { SmTaskTabs, TaskCounters, TaskList } from "@/components/sm/tasks";
import { Panel } from "@/components/sm/ui";

export const Route = createFileRoute("/tareas")({
  head: pageHead("Mis tareas", "Tareas donde la persona de SM es responsable, en todos los negocios que lleva."),
  component: SmMyTasks,
});

// SM's own team is a firm like any other: same counters and same list as a partner firm, scoped to the
// person logged in. A consultant opens the portal and sees what is due before the funnel.
function SmMyTasks() {
  const { t } = useApp();
  const { tasks } = useTasks();
  const mine = tasks.filter((x) => x.responsible === SM_USER);
  return (
    <div className="space-y-4">
      <SmTaskTabs active="mine" />
      <div>
        <h2 className="text-xl font-semibold">{SM_USER}</h2>
        <div className="text-sm text-muted-foreground">{t("Tareas donde sos responsable, en todos los negocios que llevás", "Tasks where you are responsible, across every business you run")}</div>
      </div>
      <TaskCounters tasks={mine} />
      <Panel title={t("Mis tareas por negocio", "My tasks by business")} action={<span className="num text-xs text-muted-foreground">{mine.length} {t("tareas", "tasks")}</span>}>
        <TaskList tasks={mine} viewer="sm" />
      </Panel>
    </div>
  );
}
