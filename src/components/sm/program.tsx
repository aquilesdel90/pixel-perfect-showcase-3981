import { Check, ChevronRight, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/lib/app-state";
import { PROGRAM } from "@/lib/config";
import type { AreaState, Business } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Bar } from "./ui";

export function areasValidated(b: Business) {
  return (b.areas ?? []).every((a) => a.skipped || a.step >= 4);
}

// renderArea lets each page wrap an area column in its own link (SM and owner go to different routes).
export function ProgramHeader({ b, renderArea = (_a, node) => node }: { b: Business; renderArea?: (a: AreaState, node: ReactNode) => ReactNode }) {
  const { lang, t } = useApp();
  const day = b.day ?? 0;
  const diag = PROGRAM.gates.diagnostico;
  const cierre = PROGRAM.gates.cierre;
  const diagDone = day > diag.end;
  const closeOpen = areasValidated(b);
  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{t("Día", "Day")} <b className="num text-foreground">{day}</b> {t("de", "of")} {PROGRAM.totalDays}</span>
        <div className="relative h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted sm:w-1/2">
          <div className="h-full bg-gold" style={{ width: `${(day / PROGRAM.totalDays) * 100}%` }} />
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-[150px_1fr_150px]">
        <Gate name={diag[lang]} range={`${t("Días", "Days")} ${diag.start}–${diag.end}`} state={diagDone ? "done" : "active"} />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {(b.areas ?? []).map((a) => <div key={a.area}>{renderArea(a, <AreaColumn a={a} locked={!diagDone} />)}</div>)}
        </div>
        <Gate name={cierre[lang]} range={`${t("Días", "Days")} ${cierre.start}–${cierre.end}`}
          state={b.stage === "franchisor" ? "done" : closeOpen ? "active" : "locked"}
          note={!closeOpen ? t("Se abre cuando todas las áreas activas estén validadas", "Opens when every active area is validated") : undefined} />
      </div>
    </div>
  );
}

function Gate({ name, range, state, note }: { name: string; range: string; state: "done" | "active" | "locked"; note?: string | undefined }) {
  const { t } = useApp();
  return (
    <div className={cn("flex flex-col justify-center rounded-md border-2 p-3",
      state === "done" && "border-success/50 bg-success/5", state === "active" && "border-gold bg-gold/10", state === "locked" && "border-dashed bg-muted/50")}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {state === "done" ? <Check className="h-3.5 w-3.5 text-success" /> : state === "locked" ? <Lock className="h-3.5 w-3.5" /> : null}
        {t("Compuerta", "Gate")}
      </div>
      <div className="font-display text-sm font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">{range}</div>
      {note && <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{note}</div>}
    </div>
  );
}

function AreaColumn({ a, locked }: { a: AreaState; locked: boolean }) {
  const { lang, t } = useApp();
  const area = PROGRAM.areas.find((x) => x.id === a.area)!;
  const step = PROGRAM.steps[Math.min(a.step, 4)] ?? PROGRAM.steps[0];
  if (a.skipped) {
    return (
      <div className="rounded-md border border-dashed bg-muted/40 p-3 text-muted-foreground" title={a.skipReason}>
        <div className="font-display text-sm font-semibold line-through decoration-muted-foreground/60">{area[lang]}</div>
        <div className="mt-0.5 text-xs">{t("No requerida según el assessment", "Not needed per the assessment")}</div>
        <div className="mt-2 h-1.5 rounded-full bg-muted" />
        <div className="mt-2 flex gap-1">{PROGRAM.steps.map((_, i) => <span key={i} className="h-1 flex-1 rounded-full bg-muted" />)}</div>
      </div>
    );
  }
  return (
    <div className={cn("group rounded-md border bg-background/60 p-3 transition-colors hover:border-primary/50", locked && "opacity-60")}>
      <div className="flex items-center justify-between font-display text-sm font-semibold">{area[lang]}<ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {locked ? t("Empieza día ", "Starts day ") + area.start : a.step >= 5 ? t("Completa", "Complete") : step[lang]}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Bar value={a.progress} tone={a.step >= 4 ? "green" : "navy"} />
        <span className="num text-xs">{a.progress}%</span>
      </div>
      <StepDots step={a.step} />
    </div>
  );
}

export function StepDots({ step }: { step: number }) {
  return (
    <div className="mt-2 flex gap-1">
      {PROGRAM.steps.map((_, i) => (
        <span key={i} className={cn("h-1 flex-1 rounded-full", i < step ? "bg-success" : i === step ? "bg-gold" : "bg-muted")} />
      ))}
    </div>
  );
}

export function AreaCard({ a, clickable }: { a: AreaState; clickable?: boolean }) {
  const { lang, t } = useApp();
  const area = PROGRAM.areas.find((x) => x.id === a.area)!;
  if (a.skipped) {
    return (
      <div className="panel border-dashed p-4 text-muted-foreground">
        <div className="font-display font-semibold line-through decoration-muted-foreground/60">{area[lang]}</div>
        <div className="mt-1 text-xs">{t("No requerida en este programa.", "Not needed in this program.")}</div>
        {a.skipReason && <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs">{a.skipReason}</div>}
      </div>
    );
  }
  return (
    <div className={cn("panel h-full p-4", clickable && "transition-colors hover:border-primary/50")}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display font-semibold">{area[lang]}</div>
          <div className="text-xs text-muted-foreground">{t("Responsable", "Owner")}: {a.responsible}</div>
        </div>
        <span className="num font-display text-lg font-semibold">{a.progress}%</span>
      </div>
      <ol className="mt-3 grid grid-cols-5 gap-1">
        {PROGRAM.steps.map((s, i) => (
          <li key={i} className="text-center">
            <div className={cn("mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
              i < a.step ? "bg-success text-primary-foreground" : i === a.step ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground")}>
              {i < a.step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <div className={cn("text-[11px] leading-tight", i === a.step ? "font-semibold" : "text-muted-foreground")}>{s[lang]}</div>
          </li>
        ))}
      </ol>
      {a.ownerNext !== "—" && (
        <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs">
          <span className="text-muted-foreground">{t("Próximo del dueño", "Owner next")}: </span>{a.ownerNext}
        </div>
      )}
      {clickable && <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">{t("Ver acciones", "See actions")}<ChevronRight className="h-3.5 w-3.5" /></div>}
    </div>
  );
}
