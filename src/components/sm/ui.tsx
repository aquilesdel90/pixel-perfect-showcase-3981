import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "red" | "navy" | "gold" | "grey";
const toneCls: Record<Tone, string> = {
  green: "bg-success/15 text-success",
  amber: "bg-warning/20 text-foreground",
  red: "bg-danger/15 text-danger",
  navy: "bg-primary/12 text-primary",
  gold: "bg-gold/25 text-gold-foreground dark:text-gold",
  grey: "bg-muted text-muted-foreground",
};

// Status pill: fully round, with a colored dot so states read at a glance instead of as boxed tags.
export function Pill({ tone = "grey", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11.5px] font-medium leading-5 whitespace-nowrap", toneCls[tone])} style={{ borderRadius: 999 }}>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export function Bar({ value, tone = "navy", className }: { value: number; tone?: "navy" | "gold" | "green" | "amber" | "red"; className?: string }) {
  const c = { navy: "bg-primary", gold: "bg-gold", green: "bg-success", amber: "bg-warning", red: "bg-danger" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full", c)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("panel", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <h3 className="text-sm font-semibold">{title}</h3>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

// KPI tile. `tone` paints a left accent and tints the number so the key figure stands out from its neighbours.
export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "navy" | "gold" | "green" | "amber" | "red" }) {
  const accent = tone ? { navy: "border-l-primary", gold: "border-l-gold", green: "border-l-success", amber: "border-l-warning", red: "border-l-danger" }[tone] : "";
  const text = tone ? { navy: "text-primary", gold: "text-gold-foreground dark:text-gold", green: "text-success", amber: "text-foreground", red: "text-danger" }[tone] : "";
  return (
    <div className={cn("panel px-4 py-3", tone && cn("border-l-4", accent))}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("num mt-1 font-display text-2xl font-semibold leading-tight", text)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="num w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-3 [&_td]:py-2 [&_tr]:border-b [&_tr:last-child]:border-0">{children}</tbody>
      </table>
    </div>
  );
}

export function Btn({ children, variant = "primary", onClick, className }: { children: ReactNode; variant?: "primary" | "gold" | "ghost" | "outline"; onClick?: () => void; className?: string }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    gold: "bg-gold text-gold-foreground hover:bg-gold/90",
    ghost: "hover:bg-muted",
    outline: "border bg-card hover:bg-muted",
  }[variant];
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", v, className)}>
      {children}
    </button>
  );
}

export function LineChart({ series, labels, height = 160 }: { series: { values: number[]; tone: string; dashed?: boolean; name: string }[]; labels: string[]; height?: number }) {
  const w = 600;
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.1 || 1;
  const x = (i: number) => (i / (labels.length - 1)) * w;
  const y = (v: number) => height - 6 - (v / max) * (height - 12);
  // Lines live in a stretched SVG; labels are plain HTML below it so text never distorts.
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2={w} y1={y(max * f / 1.1)} y2={y(max * f / 1.1)} stroke="var(--color-border)" vectorEffect="non-scaling-stroke" />
        ))}
        {series.map((s) => (
          <polyline key={s.name} fill="none" stroke={s.tone} strokeWidth="2.5" strokeDasharray={s.dashed ? "6 5" : undefined} vectorEffect="non-scaling-stroke"
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        {labels.map((l, i) => <span key={i} className="num">{l}</span>)}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: s.tone }} />{s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Bars({ values, labels, height = 140 }: { values: number[]; labels: string[]; height?: number }) {
  const max = Math.max(...values) || 1;
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t bg-primary/80" style={{ height: `${(v / max) * (height - 24)}px` }} />
          <span className="text-xs text-muted-foreground">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
