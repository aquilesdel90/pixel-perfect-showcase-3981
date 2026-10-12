import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { useTasks } from "@/lib/task-store";
import { TaskDetail } from "@/components/sm/tasks";
import { Panel } from "@/components/sm/ui";

export const Route = createFileRoute("/firma/tareas/$id")({
  head: () => ({ meta: [{ title: "Tarea — Firma aliada — SM Platform" }, { name: "description", content: "Detalle de una tarea del programa para la firma que la ejecuta." }] }),
  component: PartnerTask,
});

// The firm opens only tasks assigned to it. A task of another firm (or a guessed id) shows nothing of it:
// the partner never sees the business beyond its own tasks.
function PartnerTask() {
  const { id } = Route.useParams();
  const { t, partnerFirm } = useApp();
  const { getTask } = useTasks();
  const task = getTask(id);
  return (
    <div className="space-y-3">
      <Link to="/firma" search={{}} className="text-sm text-muted-foreground hover:text-foreground">← {t("Mis tareas", "My tasks")}</Link>
      {task && task.firm === partnerFirm ? <TaskDetail task={task} viewer="partner" /> : (
        <Panel><p className="text-sm text-muted-foreground">{t("Esta tarea no está asignada a tu firma.", "This task is not assigned to your firm.")}</p></Panel>
      )}
    </div>
  );
}
