import { Link } from "@tanstack/react-router";
import { BookOpen, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { FEES } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { franchises, manualHistory, tickets, type Business } from "@/lib/mock-data";
import { DocPill } from "./status";
import { Btn, Panel, Pill, Stat, Table } from "./ui";

export const nextVersion = (v: string) => {
  const [major = "1", minor = "0"] = v.replace("v", "").split(".");
  return `v${major}.${Number(minor) + 1}`;
};

// Home of a small business that finished the program and now sells franchises.
// Its manual is the "encyclopedia": every franchise gets a copy and every new version flows down.
export function FranchisorHome({ b }: { b: Business }) {
  const { t, lang, manualVersions, publishManual } = useApp();
  const mine = franchises.filter((f) => f.franchisor === b.id);
  const operating = mine.filter((f) => f.status === "operating");
  const sales = operating.reduce((s, f) => s + (f.sales.at(-1)?.v ?? 0), 0);
  const royaltyToMe = sales * FEES.royalty * (1 - FEES.smShareOfRoyalty);
  const current = manualVersions[b.id] ?? "v1.0";
  const [history, setHistory] = useState(manualHistory[b.id] ?? []);
  const [note, setNote] = useState("");
  const openTickets = tickets.filter((x) => mine.some((f) => f.id === x.franchise) && x.state === "open");

  const publish = () => {
    if (!note.trim()) { toast.error(t("Escribí qué cambió en esta versión", "Describe what changed in this version")); return; }
    const v = nextVersion(current);
    publishManual(b.id, v);
    setHistory([{ v, date: "2026-10-09", note: note.trim() }, ...history]);
    setNote("");
    toast.success(t(`${v} publicada. Bajó automáticamente a ${mine.length} franquicias; cada una ve qué cambió.`, `${v} published. It flowed down to ${mine.length} franchises; each one sees what changed.`));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{b.name}</h2>
          <div className="text-sm text-muted-foreground">
            {t("Small Business · Franquiciadora desde el", "Small Business · Franchisor since")} {fdate(b.stageSince, lang)} · Bishop: {b.bishop} · {t("Consultor SM", "SM consultant")}: {b.consultant}
          </div>
        </div>
        <Pill tone="green" fit>{t("Programa completado, 180 de 180", "Program complete, 180 of 180")}</Pill>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Franquicias", "Franchises")} value={`${operating.length} + ${mine.length - operating.length}`} sub={t("operando + en apertura", "operating + opening")} tone="navy" />
        <Stat label={t("Ventas de franquicias (sep)", "Franchise sales (Sep)")} value={usd(sales)} sub={t("reportadas por cada local", "reported by each location")} />
        <Stat label={t("Regalías para vos (sep)", "Your royalties (Sep)")} value={usd(royaltyToMe)} sub={`${FEES.royalty * 100}% ${t("menos la parte de SM", "minus SM's share")}`} tone="gold" />
        <Stat label={t("Manual vigente", "Current manual")} value={current} sub={history[0] ? fdate(history[0].date, lang) : ""} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel title={<span className="inline-flex items-center gap-1.5"><Store className="h-4 w-4" />{t("Mis franquicias", "My franchises")}</span>} action={<Link to="/dueno/franquicias" className="text-xs text-primary hover:underline">{t("Ver detalle", "See detail")}</Link>}>
          <Table head={[t("Franquicia", "Franchise"), t("Dueño", "Owner"), t("Estado", "Status"), t("Ventas (sep)", "Sales (Sep)"), t("Estándares", "Standards"), t("Manual", "Manual")]}>
            {mine.map((f) => {
              const upToDate = f.manualVersion === current;
              return (
                <tr key={f.id}>
                  <td className="font-medium">{f.name}</td>
                  <td>{f.buyer}</td>
                  <td><DocPill state={f.status} /></td>
                  <td className="num">{f.sales.length ? usd(f.sales.at(-1)!.v) : "—"}</td>
                  <td className="num">{f.standards ? `${f.standards}%` : "—"}</td>
                  <td><Pill tone={upToDate ? "green" : "amber"}>{upToDate ? `${f.manualVersion} · ${t("al día", "up to date")}` : `${t("leer", "read")} ${current}`}</Pill></td>
                </tr>
              );
            })}
          </Table>
          <p className="mt-3 text-xs text-muted-foreground">{t("Cada franquicia nace con una copia de tu manual, su checklist de apertura y sus auditorías. SM las administra; vos ves cómo van.", "Each franchise starts with a copy of your manual, its opening checklist and its audits. SM runs them; you watch how they do.")}</p>
        </Panel>

        <Panel title={<span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{t("Enciclopedia del negocio", "Business encyclopedia")}</span>} action={<Pill tone="navy" fit dot={false}>{current}</Pill>}>
          <p className="text-xs text-muted-foreground">{t("Todo lo documentado en los 180 días: procesos, formularios, estándares. Es lo que compra cada franquiciado y lo que SM audita.", "Everything documented in the 180 days: processes, forms, standards. It is what every franchisee buys and what SM audits.")}</p>
          <ul className="mt-3 space-y-1.5 text-xs">
            {history.slice(0, 3).map((h) => <li key={h.v} className="flex gap-2"><b className="num shrink-0">{h.v}</b><span className="text-muted-foreground">{fdate(h.date, lang)} · {h.note}</span></li>)}
          </ul>
          <div className="mt-3 space-y-2 border-t pt-3">
            <div className="text-xs font-semibold">{t("Publicar", "Publish")} {nextVersion(current)}</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Qué cambió (ej.: nuevo proveedor, nuevo protocolo)", "What changed (e.g. new supplier, new protocol)")} className="h-14 w-full rounded-md border bg-background p-2 text-xs" />
            <Btn onClick={publish}>{t("Publicar y enviar a las franquicias", "Publish and send to franchises")}</Btn>
          </div>
          <div className="mt-3"><Link to="/dueno/manual" className="text-xs text-primary hover:underline">{t("Abrir el manual", "Open the manual")}</Link></div>
        </Panel>
      </div>

      <Panel title={t("Te toca a vos", "Your turn")} action={<Pill tone={openTickets.length ? "amber" : "green"} fit>{openTickets.length + 2} {t("pendientes", "pending")}</Pill>}>
        <ul className="divide-y text-sm">
          {openTickets.map((x) => (
            <li key={x.id} className="flex items-center justify-between py-2">
              <div><span className="num text-muted-foreground">{x.id}</span> {x.subject}<div className="text-xs text-muted-foreground">{franchises.find((f) => f.id === x.franchise)?.name} · {t("SM lo escaló a vos", "SM escalated it to you")}</div></div>
              <Btn variant="outline" onClick={() => toast.success(t("Respuesta enviada", "Reply sent"))}>{t("Responder", "Reply")}</Btn>
            </li>
          ))}
          <li className="flex items-center justify-between py-2"><div>{t("Auditoría de estándares, Orlando Sur", "Standards audit, Orlando Sur")}<div className="text-xs text-muted-foreground">22 oct · {t("SM te manda el informe", "SM sends you the report")}</div></div><Pill tone="grey">{t("Programada", "Scheduled")}</Pill></li>
          <li className="flex items-center justify-between py-2"><div>{t("Capacitación de apertura, Tampa", "Opening training, Tampa")}<div className="text-xs text-muted-foreground">{t("40 h, semana del 3 nov · tu equipo entrena al de Marco", "40 h, week of Nov 3 · your team trains Marco's")}</div></div><Pill tone="navy">{t("Confirmar fecha", "Confirm date")}</Pill></li>
        </ul>
      </Panel>
    </div>
  );
}
