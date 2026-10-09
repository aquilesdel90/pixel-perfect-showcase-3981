import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { ASSESSMENT, FEES, FRANCHISABILITY_THRESHOLD, PROFIT_SPLIT, PROGRAM } from "@/lib/config";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { Btn, Panel, Pill, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/configuracion")({
  head: pageHead("Configuración", "Plantilla del programa, versiones del assessment, integraciones y notificaciones."),
  component: Settings,
});

const INTEGRATIONS = [
  ["DocuSeal", "Firma electrónica de contratos", "E-signature for contracts", true],
  ["Resend", "Emails transaccionales", "Transactional email", true],
  ["QuickBooks", "Finanzas de los negocios", "Business finances", true],
  ["Google Calendar", "Agenda y Meet", "Calendar and Meet", true],
  ["Google Workspace", "Cuentas de los negocios", "Business accounts", true],
  ["Perplexity", "Investigación de mercado", "Market research", false],
] as const;

function Settings() {
  const { t, lang } = useApp();
  const [tab, setTab] = useState("programa");
  const tabs = [["programa", t("Plantilla del programa", "Program template")], ["assessment", "Assessment"], ["integraciones", t("Integraciones", "Integrations")], ["notificaciones", t("Notificaciones", "Notifications")]];
  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto border-b">
        {tabs.map(([k = "", l]) => <button key={k} onClick={() => setTab(k)} className={cn("whitespace-nowrap border-b-2 px-3 py-2 text-sm", tab === k ? "border-gold font-semibold" : "border-transparent text-muted-foreground")}>{l}</button>)}
      </div>
      {tab === "programa" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title={t("Compuertas y áreas", "Gates and areas")}>
            <Table head={[t("Nombre", "Name"), t("Tipo", "Type"), t("Días", "Days")]}>
              <tr><td className="font-medium">{PROGRAM.gates.diagnostico[lang]}</td><td><Pill tone="gold">{t("Compuerta", "Gate")}</Pill></td><td>{PROGRAM.gates.diagnostico.start}–{PROGRAM.gates.diagnostico.end}</td></tr>
              {PROGRAM.areas.map((a) => <tr key={a.id}><td className="font-medium">{a[lang]}</td><td><Pill tone="navy">{t("Área paralela", "Parallel area")}</Pill></td><td>{a.start}–{a.end}</td></tr>)}
              <tr><td className="font-medium">{PROGRAM.gates.cierre[lang]}</td><td><Pill tone="gold">{t("Compuerta", "Gate")}</Pill></td><td>{PROGRAM.gates.cierre.start}–{PROGRAM.gates.cierre.end}</td></tr>
            </Table>
            <div className="mt-3 text-xs text-muted-foreground">{t("Pasos por área", "Steps per area")}: {PROGRAM.steps.map((s) => s[lang]).join(" → ")}</div>
          </Panel>
          <Panel title={t("Parámetros", "Parameters")}>
            <Table head={[t("Parámetro", "Parameter"), t("Valor", "Value")]}>
              <tr><td>{t("Umbral de franquiciabilidad", "Franchisability threshold")}</td><td>{FRANCHISABILITY_THRESHOLD}%</td></tr>
              <tr><td>{t("Regalía", "Royalty")}</td><td>{FEES.royalty * 100}%</td></tr>
              <tr><td>{t("Fondo de marketing", "Marketing fee")}</td><td>{FEES.marketing * 100}%</td></tr>
              <tr><td>{t("Participación SM en regalía", "SM share of royalty")}</td><td>{FEES.smShareOfRoyalty * 100}%</td></tr>
              <tr><td>{t("Bishop año 1", "Bishop year 1")}</td><td>{PROFIT_SPLIT.bishopYear1 * 100}%</td></tr>
              <tr><td>{t("Bishop estabilizado", "Bishop stabilized")}</td><td>{PROFIT_SPLIT.bishopStabilized * 100}%</td></tr>
              <tr><td>{t("SM desde año 2", "SM from year 2")}</td><td>{PROFIT_SPLIT.smFromYear2 * 100}%</td></tr>
            </Table>
            <p className="mt-2 text-xs text-muted-foreground">{t("La regla de reparto no es definitiva.", "The split rule is not final.")}</p>
          </Panel>
        </div>
      )}
      {tab === "assessment" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title={t("Versiones", "Versions")} action={<Btn variant="outline">{t("Editar preguntas (superadmin)", "Edit questions (superadmin)")}</Btn>}>
            <Table head={[t("Versión", "Version"), t("Fecha", "Date"), t("Autor", "Author"), t("Cambio", "Change")]}>
              {ASSESSMENT.versions.map((v) => <tr key={v.v}><td><b>{v.v}</b> {v.current && <Pill tone="green">{t("Actual", "Current")}</Pill>}</td><td>{fdate(v.date, lang)}</td><td>{v.by}</td><td className="text-muted-foreground">{v.note}</td></tr>)}
            </Table>
            <p className="mt-2 text-xs text-muted-foreground">{t("Cada edición crea una nueva versión. Cada assessment guarda con qué versión fue puntuado.", "Every edit creates a new version. Each assessment stores which version scored it.")}</p>
          </Panel>
          <Panel title={`${ASSESSMENT.questions} ${t("preguntas en 8 áreas · escala 0–3", "questions in 8 areas · 0–3 scale")}`}>
            <div className="flex flex-wrap gap-1.5">{ASSESSMENT.areas.map((a) => <Pill key={a} tone="navy">{a}</Pill>)}</div>
            <div className="mt-4 grid grid-cols-5 gap-1 text-center text-xs">
              {ASSESSMENT.levels.map((l) => <div key={l.level} className="rounded-md bg-muted p-2"><b>{l.level}</b><div className="text-muted-foreground">≥{l.min}%</div></div>)}
            </div>
          </Panel>
        </div>
      )}
      {tab === "integraciones" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {INTEGRATIONS.map(([n, es, en, on]) => (
            <div key={n} className="panel flex items-center justify-between p-4">
              <div><div className="font-display font-semibold">{n}</div><div className="text-xs text-muted-foreground">{lang === "es" ? es : en}</div></div>
              {on ? <Pill tone="green">{t("Conectado", "Connected")}</Pill> : <Btn variant="outline">{t("Conectar", "Connect")}</Btn>}
            </div>
          ))}
        </div>
      )}
      {tab === "notificaciones" && <NotifPrefs />}
    </div>
  );
}

export function NotifPrefs() {
  const { t } = useApp();
  const items = [t("Entregable vencido", "Overdue deliverable"), t("Documento recibido", "Document received"), t("Contrato firmado", "Contract signed"), t("Nuevo assessment completado", "New assessment completed"), t("Ticket de franquicia", "Franchise ticket")];
  return (
    <Panel title={t("Notificaciones", "Notifications")}>
      <Table head={[t("Evento", "Event"), "Email", t("En la plataforma", "In-app")]}>
        {items.map((i) => <tr key={i}><td>{i}</td><td><input type="checkbox" defaultChecked className="accent-primary" /></td><td><input type="checkbox" defaultChecked className="accent-primary" /></td></tr>)}
      </Table>
    </Panel>
  );
}
