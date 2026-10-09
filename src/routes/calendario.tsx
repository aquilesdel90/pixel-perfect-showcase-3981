import { createFileRoute } from "@tanstack/react-router";
import { Info, Video } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { businesses, events, getBusiness, team, WEEK, WEEK_EN } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/sm/ui";

export const Route = createFileRoute("/calendario")({
  head: pageHead("Calendario", "Calendario semanal sincronizado con Google Calendar y Meet."),
  component: Calendar,
});

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);

function Calendar() {
  const { t, lang, role } = useApp();
  const ownerView = role === "owner";
  const [biz, setBiz] = useState(ownerView ? "vossler" : "");
  const [mem, setMem] = useState("");
  const week = lang === "es" ? WEEK : WEEK_EN;
  const list = events.filter((e) => (ownerView ? e.business === "vossler" : (!biz || e.business === biz) && (!mem || e.member === mem || e.kind === "client")));
  const H = 48;

  return (
    <div className="space-y-4">
      {!ownerView && (
        <div className="flex flex-wrap gap-2">
          <select value={biz} onChange={(e) => setBiz(e.target.value)} className="h-8 rounded-md border bg-card px-2 text-sm">
            <option value="">{t("Todos los negocios", "All businesses")}</option>
            {businesses.filter((b) => b.stage === "program" || b.stage === "franchisor").map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={mem} onChange={(e) => setMem(e.target.value)} className="h-8 rounded-md border bg-card px-2 text-sm">
            <option value="">{t("Todo el equipo", "Whole team")}</option>
            {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary" />{t("Reunión SM", "SM meeting")}</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-gold" />{t("Vencimiento", "Due date")}</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted-foreground/30" />{t("Evento del cliente", "Client event")}</span>
          </div>
        </div>
      )}
      <div className="panel overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b text-xs">
            <div />
            {week.map((d, i) => <div key={d} className={cn("border-l px-2 py-2 font-medium", i === 4 && "text-primary")}>{d} oct</div>)}
          </div>
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b text-[11px]">
            <div className="px-2 py-1 text-muted-foreground">{t("Todo el día", "All day")}</div>
            {week.map((d, i) => (
              <div key={d} className="min-h-7 space-y-0.5 border-l p-0.5">
                {list.filter((e) => e.kind === "due" && e.day === i).map((e) => <div key={e.id} className="truncate rounded bg-gold px-1 text-gold-foreground">{e.title}</div>)}
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[56px_repeat(7,1fr)]">
            <div>{HOURS.map((h) => <div key={h} className="num border-b px-2 text-[11px] text-muted-foreground" style={{ height: H }}>{h}:00</div>)}</div>
            {week.map((d, i) => (
              <div key={d} className="relative border-l">
                {HOURS.map((h) => <div key={h} className="border-b border-border/60" style={{ height: H }} />)}
                {list.filter((e) => e.kind !== "due" && e.day === i).map((e) => (
                  <div key={e.id} title={e.kind === "client" ? t("Evento del cliente — no editable", "Client event — not editable") : ""}
                    className={cn("absolute inset-x-1 overflow-hidden rounded px-1.5 py-1 text-[11px] leading-tight",
                      e.kind === "client" ? "cursor-not-allowed bg-muted-foreground/20 text-muted-foreground" : "cursor-pointer bg-primary text-primary-foreground")}
                    style={{ top: (e.start - 8) * H + 1, height: e.dur * H - 2 }}>
                    <div className="flex items-center gap-1 font-medium">{e.meet && <Video className="h-3 w-3" />}{e.title}</div>
                    <div className="opacity-80">{getBusiness(e.business)?.name}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Panel title={<span className="inline-flex items-center gap-1.5"><Info className="h-4 w-4" />{t("Cómo funciona", "How it works")}</span>}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{t("Durante el Diagnóstico se crea una cuenta de Google Workspace para el negocio y se conecta al portal.", "During Diagnosis a Google Workspace account is created for the business and connected.")}</li>
          <li>{t("Las reuniones que SM agenda aparecen en el Google Calendar del cliente con link de Meet y notificación.", "Meetings SM schedules appear in the client's Google Calendar with a Meet link and notification.")}</li>
          <li>{t("Los vencimientos de entregables se publican como eventos de todo el día.", "Deliverable due dates publish as all-day events.")}</li>
          <li>{t("Los eventos propios del cliente se ven en gris y SM no puede editarlos.", "The client's own events show greyed out and SM cannot edit them.")}</li>
        </ul>
      </Panel>
    </div>
  );
}
