import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { CURRENT, FEES } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { franchises, franchiseTasks, getBusiness, team, tickets } from "@/lib/mock-data";
import { StandardsChecklist } from "@/components/sm/franchise";
import { DocPill } from "@/components/sm/status";
import { Btn, Panel, Pill, Stat } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicia/")({
  head: pageHead("Mi franquicia", "Ventas, regalías, estándares y soporte de la franquicia."),
  component: FranchiseHome,
});

function FranchiseHome() {
  const { t, lang, manualVersions } = useApp();
  const f = franchises.find((x) => x.id === CURRENT.franchise)!;
  const franchisor = getBusiness(f.franchisor)!;
  const consultant = team.find((m) => m.name === franchisor.consultant);
  const last = f.sales.at(-1) ?? { m: "", v: 0 };
  const prev = f.sales.at(-2);
  const growth = prev ? Math.round((last.v / prev.v - 1) * 100) : 0;
  const [tasks, setTasks] = useState(franchiseTasks);
  const [list, setList] = useState(tickets.filter((x) => x.franchise === f.id));
  const [subject, setSubject] = useState("");
  const newTicket = () => {
    if (!subject.trim()) return;
    setList([{ id: `T-${121 + list.length}`, franchise: f.id, subject: subject.trim(), state: "open", date: "2026-10-09" }, ...list]);
    setSubject("");
    toast.success(t("Ticket creado. SM responde en menos de 24 h.", "Ticket created. SM replies within 24 h."));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{f.name}</h2>
          <div className="text-sm text-muted-foreground">{t("Franquiciadora", "Franchisor")}: {franchisor.name} · {t("abierta el", "opened on")} {fdate(f.opening, lang)} · {t("Tu consultora SM", "Your SM consultant")}: {franchisor.consultant}{consultant && <> · {consultant.email}</>}</div>
        </div>
        <DocPill state={f.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Ventas del mes", "Sales this month")} value={usd(last.v)} sub={`${growth >= 0 ? "+" : ""}${growth}% ${t("vs. mes anterior", "vs. last month")}`} tone="navy" />
        <Stat label={t("Regalía del mes", "Royalty this month")} value={usd(last.v * FEES.royalty)} sub={`${FEES.royalty * 100}% · ${t("pagada el 8 oct", "paid Oct 8")}`} tone="gold" />
        <Stat label={t("Estándares", "Standards")} value={`${f.standards}%`} sub={t("auditoría 28 sep", "audit Sep 28")} tone={f.standards >= 85 ? "green" : "amber"} />
        {manualVersions[f.franchisor] && manualVersions[f.franchisor] !== f.manualVersion
          ? <Stat label={t("Manual", "Manual")} value={manualVersions[f.franchisor]} sub={t(`nueva versión de ${franchisor.name}, leer cambios`, `new version from ${franchisor.name}, read changes`)} tone="amber" />
          : <Stat label={t("Manual", "Manual")} value={f.manualVersion} sub={t(`copia del manual de ${franchisor.name}`, `copy of ${franchisor.name}'s manual`)} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={t("Te toca a vos", "Your turn")} action={<Pill tone={tasks.length ? "amber" : "green"}>{tasks.length}</Pill>}>
          {tasks.length === 0 ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />{t("Todo al día.", "All caught up.")}</p> : (
            <ul className="divide-y">
              {tasks.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-2 py-2">
                  <div><div className="text-sm font-medium">{lang === "es" ? x.es : x.en}</div><div className="text-xs text-muted-foreground">{t("Vence", "Due")} {fdate(x.due, lang)}</div></div>
                  {x.id === "ft1" ? <Link to="/franquicia/pagos"><Btn variant="outline">{t("Enviar", "Send")}</Btn></Link>
                    : x.id === "ft3" ? <Link to="/franquicia/manual"><Btn variant="outline">{t("Leer", "Read")}</Btn></Link>
                    : <Btn variant="outline" onClick={() => { setTasks(tasks.filter((y) => y.id !== x.id)); toast.success(t("Marcado como hecho", "Marked as done")); }}>{t("Hecho", "Done")}</Btn>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <StandardsChecklist />
        <Panel title={t("Soporte SM", "SM support")}>
          <ul className="divide-y">
            {list.map((x) => (
              <li key={x.id} className="flex items-center justify-between py-2 text-sm">
                <div><span className="num text-muted-foreground">{x.id}</span> {x.subject}<div className="text-xs text-muted-foreground">{fdate(x.date, lang)}</div></div>
                <DocPill state={x.state} />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("Contanos el problema", "Describe the issue")} className="h-8 flex-1 rounded-md border bg-background px-2 text-sm" />
            <Btn onClick={newTicket}>{t("Nuevo ticket", "New ticket")}</Btn>
          </div>
        </Panel>
      </div>
    </div>
  );
}
