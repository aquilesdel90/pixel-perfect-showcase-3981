import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { usd } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { services, team } from "@/lib/mock-data";
import { Btn, Panel, Pill, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/catalogo")({
  head: pageHead("Catálogo y equipo", "Catálogo de servicios de Strategic Mates y usuarios del equipo SM."),
  component: Catalog,
});

function Catalog() {
  const { t, lang } = useApp();
  return (
    <div className="space-y-4">
      <Panel title={t("Catálogo de servicios", "Service catalog")} action={<Btn>{t("Nuevo servicio", "New service")}</Btn>}>
        <Table head={[t("Servicio", "Service"), t("Fase", "Phase"), t("Entregables", "Deliverables"), t("Precio individual", "Standalone price")]}>
          {services.map((s) => <tr key={s.name}><td className="font-medium">{s.name}</td><td><Pill tone="navy" dot={false}>{s.phase}</Pill></td><td className="text-muted-foreground">{s.deliverables}</td><td className="text-right">{usd(s.price)}</td></tr>)}
        </Table>
      </Panel>
      <Panel title={t("Equipo SM", "SM team")} action={<Btn variant="outline">{t("Invitar usuario", "Invite user")}</Btn>}>
        <Table head={[t("Nombre", "Name"), t("Puesto", "Position"), "Email", t("Rol en plataforma", "Platform role")]}>
          {team.map((m) => <tr key={m.id}><td className="font-medium">{m.name}</td><td>{lang === "es" ? m.role : m.roleEn}</td><td>{m.email}</td><td><Pill tone={m.access === "Superadmin" ? "gold" : "navy"}>{m.access}</Pill></td></tr>)}
        </Table>
      </Panel>
    </div>
  );
}
