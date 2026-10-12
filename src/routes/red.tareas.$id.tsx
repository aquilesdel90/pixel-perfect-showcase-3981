import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { useTasks } from "@/lib/task-store";
import { TaskDetail } from "@/components/sm/tasks";
import { Panel } from "@/components/sm/ui";

export const Route = createFileRoute("/red/tareas/$id")({
  head: () => ({ meta: [{ title: "Tarea — Tareas de la red — SM Platform" }, { name: "description", content: "Detalle de una tarea del programa visto por SM, con reasignación y cambio de fecha." }] }),
  component: NetworkTask,
});

// Same detail the partner firm sees, plus SM controls (reassign firm, move due date).
function NetworkTask() {
  const { id } = Route.useParams();
  const { t } = useApp();
  const task = useTasks().getTask(id);
  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm">
        <Link to="/red" className="text-muted-foreground hover:text-foreground">← {t("Tareas de la red", "Network tasks")}</Link>
        <Link to="/tareas" className="text-muted-foreground hover:text-foreground">{t("Mis tareas", "My tasks")}</Link>
      </div>
      {task ? <TaskDetail task={task} viewer="sm" /> : <Panel><p className="text-sm text-muted-foreground">{t("Tarea no encontrada.", "Task not found.")}</p></Panel>}
    </div>
  );
}
