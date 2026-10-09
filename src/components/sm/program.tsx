import { Check, Lock } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { PROGRAM } from "@/lib/config";
import type { AreaState, Business } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Bar } from "./ui";

export function areasValidated(b: Business) {
  return (b.areas ?? []).every((a) => a.step >= 4);
}

export function ProgramHeader({ b }: { b: Business }) {
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
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(b.areas ?? []).map((a) => <AreaColumn key={a.area} a={a} locked={!diagDone} />)}
        </div>
        <Gate name={cierre[lang]} range={`${t("Días", "Days")} ${cierre.start}–${cierre.end}`}
          state={b.stage === "franchisor" ? "done" : closeOpen ? "active" : "locked"}
          note={!closeOpen ? t("Se abre cuando las 4 áreas estén validadas", "Opens when all 4 areas are validated") : undefined} />
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
  const step = PROGRAM.steps[Math.min(a.step, 4)]!;
  return (
    <div className={cn("rounded-md border bg-background/60 p-3", locked && "opacity-60")}>
      <div className="font-display text-sm font-semibold">{area[lang]}</div>
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

export function AreaCard({ a }: { a: AreaState }) {
  const { lang, t } = useApp();
  const area = PROGRAM.areas.find((x) => x.id === a.area)!;
  return (
    <div className="panel p-4">
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
    </div>
  );
}
