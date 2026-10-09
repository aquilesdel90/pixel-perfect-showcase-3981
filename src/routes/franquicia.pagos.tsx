import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { CURRENT, FEES } from "@/lib/config";
import { usd } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { franchises } from "@/lib/mock-data";
import { PaymentsTable } from "@/components/sm/franchise";
import { Btn, Panel, Stat } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicia/pagos")({
  head: pageHead("Pagos y reportes", "Ventas mensuales, regalía, fondo de marketing y recibos de la franquicia."),
  component: FranchisePayments,
});

function FranchisePayments() {
  const { t } = useApp();
  const base = franchises.find((x) => x.id === CURRENT.franchise)!;
  const [f, setF] = useState(base);
  const [amount, setAmount] = useState("");
  const reported = f.sales.some((s) => s.m === "Oct");
  const report = () => {
    const v = Number(amount.replace(/[^\d]/g, ""));
    if (!v) {
      toast.error(t("Ingresá las ventas del mes", "Enter the month's sales"));
      return;
    }
    setF({ ...f, sales: [...f.sales, { m: "Oct", v }] });
    setAmount("");
    toast.success(t(`Reporte enviado. Regalía a pagar: ${usd(v * FEES.royalty)}.`, `Report sent. Royalty due: ${usd(v * FEES.royalty)}.`));
  };
  const ytd = f.sales.reduce((s, x) => s + x.v, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t("Ventas acumuladas 2026", "2026 sales to date")} value={usd(ytd)} />
        <Stat label={t("Regalías pagadas", "Royalties paid")} value={usd(ytd * FEES.royalty)} sub={`${FEES.royalty * 100}%`} />
        <Stat label={t("Fondo de marketing", "Marketing fund")} value={usd(ytd * FEES.marketing)} sub={`${FEES.marketing * 100}%`} />
        <Stat label={t("Próximo reporte", "Next report")} value={reported ? t("Enviado", "Sent") : "5 nov"} sub={t("ventas de octubre", "October sales")} />
      </div>
      <Panel title={t("Pagos y reportes mensuales", "Monthly payments and reports")}><PaymentsTable f={f} /></Panel>
      {!reported && (
        <Panel title={t("Reportar ventas de octubre", "Report October sales")}>
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs text-muted-foreground">{t("Ventas del mes (USD)", "Sales this month (USD)")}<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="78000" className="h-8 w-48 rounded-md border bg-background px-2 text-sm text-foreground" /></label>
            <Btn onClick={report}>{t("Enviar reporte", "Send report")}</Btn>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("Si conectás QuickBooks, las ventas se cargan solas y solo confirmás.", "If you connect QuickBooks, sales load automatically and you only confirm.")}</p>
        </Panel>
      )}
    </div>
  );
}
