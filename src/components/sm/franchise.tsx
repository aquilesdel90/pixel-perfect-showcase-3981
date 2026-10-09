import { CheckSquare, Square } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { FEES } from "@/lib/config";
import { fdate, usd } from "@/lib/format";
import { openingChecklist, standards, tickets, type franchises } from "@/lib/mock-data";
import { DocPill } from "./status";
import { Bar, Panel, Table } from "./ui";

type F = (typeof franchises)[number];

export function PaymentsTable({ f }: { f: F }) {
  const { t } = useApp();
  return (
    <Table head={[t("Mes", "Month"), t("Ventas", "Sales"), t("Regalía 5%", "Royalty 5%"), t("Marketing 3%", "Marketing 3%"), t("Participación SM", "SM share"), t("Recibo", "Receipt")]}>
      {f.sales.map((s) => (
        <tr key={s.m}>
          <td>{s.m} 2026</td><td className="text-right">{usd(s.v)}</td><td className="text-right">{usd(s.v * FEES.royalty)}</td>
          <td className="text-right">{usd(s.v * FEES.marketing)}</td><td className="text-right">{usd(s.v * FEES.royalty * FEES.smShareOfRoyalty)}</td>
          <td><button className="text-xs text-primary hover:underline">PDF</button></td>
        </tr>
      ))}
      {f.sales.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">{t("Sin ventas todavía (en apertura)", "No sales yet (opening)")}</td></tr>}
    </Table>
  );
}

export function OpeningChecklist() {
  const { t } = useApp();
  const done = openingChecklist.filter((c) => c.done).length;
  return (
    <Panel title={t("Checklist de apertura", "Opening checklist")} action={<span className="num text-xs">{done}/{openingChecklist.length}</span>}>
      <Bar value={(done / openingChecklist.length) * 100} tone="gold" className="mb-3" />
      <ul className="space-y-1.5 text-sm">
        {openingChecklist.map((c) => <li key={c.item} className="flex items-center gap-2">{c.done ? <CheckSquare className="h-4 w-4 text-success" /> : <Square className="h-4 w-4 text-muted-foreground" />}{c.item}</li>)}
      </ul>
    </Panel>
  );
}

export function StandardsChecklist() {
  const { t } = useApp();
  return (
    <Panel title={t("Auditoría de estándares", "Standards audit")} action={<span className="text-xs text-muted-foreground">{t("Última", "Last")}: 28 sep 2026</span>}>
      <ul className="space-y-1.5 text-sm">
        {standards.map((c) => <li key={c.item} className="flex items-center gap-2">{c.ok ? <CheckSquare className="h-4 w-4 text-success" /> : <Square className="h-4 w-4 text-danger" />}{c.item}</li>)}
      </ul>
    </Panel>
  );
}

export function TicketsList({ franchiseId }: { franchiseId: string }) {
  const { t, lang } = useApp();
  return (
    <Panel title={t("Tickets de soporte", "Support tickets")}>
      <ul className="divide-y">
        {tickets.filter((x) => x.franchise === franchiseId).map((x) => (
          <li key={x.id} className="flex items-center justify-between py-2 text-sm">
            <div><span className="num text-muted-foreground">{x.id}</span> {x.subject}<div className="text-xs text-muted-foreground">{fdate(x.date, lang)}</div></div>
            <DocPill state={x.state} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
