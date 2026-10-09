import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { FRANCHISABILITY_THRESHOLD, TODAY } from "@/lib/config";
import { usd } from "@/lib/format";
import { businesses, type Business } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Bar, Pill } from "./ui";

// CRM-style pipeline. A column is a finer state than Business.stage: "approved" splits into
// Checkmate sent / MOU pending, and "program" splits by whether the Bishop threshold is reached.
type ColumnId = "evaluated" | "checkmate" | "mou" | "program" | "bishop" | "franchisor";

const COLUMNS: { id: ColumnId; es: string; en: string; hint: string; hintEn: string }[] = [
  { id: "evaluated", es: "Evaluado", en: "Evaluated", hint: "Assessment con puntaje; SM arma el plan según las áreas débiles", hintEn: "Scored assessment; SM builds the plan from the weak areas" },
  { id: "checkmate", es: "Aceptado", en: "Accepted", hint: "SM aceptó; arma el plan y prepara el contrato", hintEn: "SM accepted; builds the plan and prepares the contract" },
  { id: "mou", es: "Contrato por firmar", en: "Contract pending", hint: "Enviado por DocuSeal; al firmar arranca el día 1", hintEn: "Sent via DocuSeal; day 1 starts on signature" },
  { id: "program", es: "En programa", en: "In program", hint: "180 días, cuatro áreas en paralelo", hintEn: "180 days, four areas in parallel" },
  { id: "bishop", es: "Lista para Bishop", en: "Ready for Bishop", hint: `Semáforo ≥ ${FRANCHISABILITY_THRESHOLD}%, se presenta al inversor`, hintEn: `Readiness ≥ ${FRANCHISABILITY_THRESHOLD}%, presented to the investor` },
  { id: "franchisor", es: "Franquiciadora", en: "Franchisor", hint: "Acuerdo firmado, crea franquicias", hintEn: "Agreement signed, creates franchises" },
];

function columnOf(b: Business): ColumnId | null {
  if (b.stage === "evaluated") return "evaluated";
  if (b.stage === "approved") return b.substage === "mou" ? "mou" : "checkmate";
  if (b.stage === "program") return (b.franchisability ?? 0) >= FRANCHISABILITY_THRESHOLD ? "bishop" : "program";
  if (b.stage === "franchisor") return "franchisor";
  return null;
}

const daysSince = (iso: string) => Math.max(0, Math.round((new Date(TODAY).getTime() - new Date(iso).getTime()) / 864e5));

export function Pipeline() {
  const { t, lang } = useApp();
  const [showDiscarded, setShowDiscarded] = useState(false);
  const discarded = businesses.filter((b) => b.stage === "discarded");

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1080px] grid-cols-6 gap-3">
          {COLUMNS.map((c) => {
            const items = businesses.filter((b) => columnOf(b) === c.id);
            const revenue = items.reduce((s, b) => s + b.revenue, 0);
            return (
              <div key={c.id} className="flex min-w-0 flex-col rounded-md bg-muted/50 p-2">
                <div className="px-1 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{lang === "es" ? c.es : c.en}</span>
                    <span className="num rounded-full bg-card px-2 text-xs">{items.length}</span>
                  </div>
                  <div className="text-[11px] leading-tight text-muted-foreground">{lang === "es" ? c.hint : c.hintEn}</div>
                  {items.length > 0 && <div className="num mt-1 text-[11px] text-muted-foreground">{t("Facturación", "Revenue")}: {usd(revenue)}</div>}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {items.map((b) => <Card key={b.id} b={b} col={c.id} />)}
                  {items.length === 0 && <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">{t("Vacío", "Empty")}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <button onClick={() => setShowDiscarded(!showDiscarded)} className="hover:text-foreground hover:underline">
          {showDiscarded ? t("Ocultar descartados", "Hide discarded") : t("Ver descartados", "Show discarded")} ({discarded.length})
        </button>
        {showDiscarded && discarded.map((b) => (
          <Link key={b.id} to="/negocios/$id" params={{ id: b.id }} className="hover:text-foreground">{b.name} · {b.level} {b.maturity}% · {t("descartado hace", "discarded")} {daysSince(b.stageSince)} {t("días", "days ago")}</Link>
        ))}
      </div>
    </div>
  );
}

function Card({ b, col }: { b: Business; col: ColumnId }) {
  const { t } = useApp();
  const days = daysSince(b.stageSince);
  const stale = (col === "checkmate" && days > 7) || (col === "evaluated" && days > 3) || (col === "mou" && days > 10);
  const prog = Math.round((b.areas ?? []).reduce((s, a) => s + a.progress, 0) / 4);
  return (
    <Link to="/negocios/$id" params={{ id: b.id }} className={cn("block rounded-md border bg-card p-2.5 text-sm shadow-xs transition-colors hover:border-primary/50", stale && "border-warning/60")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-medium">{b.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{b.industry} · {b.city}</div>
        </div>
        <Pill tone={b.maturity >= 65 ? "green" : b.maturity >= 45 ? "navy" : "amber"} fit dot={false}>{b.level}</Pill>
      </div>
      {col === "program" && <div className="mt-2 flex items-center gap-2"><Bar value={prog} /><span className="num text-[11px]">{t("día", "day")} {b.day}</span></div>}
      {col === "bishop" && <div className="mt-2 flex items-center gap-2"><Bar value={b.franchisability ?? 0} tone="green" /><span className="num text-[11px]">{b.franchisability}%</span></div>}
      {col === "franchisor" && <div className="mt-2 text-[11px] text-muted-foreground">Bishop: {b.bishop}</div>}
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{b.consultant.split(" ")[0]}</span>
        <span className={cn("num", stale && "font-semibold text-warning")}>{days} {t("d en etapa", "d in stage")}</span>
      </div>
    </Link>
  );
}
