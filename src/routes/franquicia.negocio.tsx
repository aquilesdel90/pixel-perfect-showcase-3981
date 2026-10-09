import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { CURRENT } from "@/lib/config";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { franchises, franchiseTeam, getBusiness } from "@/lib/mock-data";
import { OpeningChecklist } from "@/components/sm/franchise";
import { Btn, Panel, Pill, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/franquicia/negocio")({
  head: pageHead("Mi franquicia", "Datos del local y del equipo de la franquicia."),
  component: FranchiseDetails,
});

function FranchiseDetails() {
  const { t, lang } = useApp();
  const f = franchises.find((x) => x.id === CURRENT.franchise)!;
  const fields: [string, string][] = [
    [t("Nombre", "Name"), f.name], [t("Franquiciadora", "Franchisor"), getBusiness(f.franchisor)?.name ?? ""],
    [t("Dueña", "Owner"), f.buyer], ["Email", "luisa@bimbotacos.com"],
    [t("Dirección", "Address"), "4120 S Orange Ave, Orlando FL"], [t("Apertura", "Opening"), fdate(f.opening, lang)],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("Datos del local", "Location details")}>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {fields.map(([k, v]) => <label key={k} className="grid gap-1"><span className="text-xs text-muted-foreground">{k}</span><input defaultValue={v} className="h-8 rounded-md border bg-background px-2" /></label>)}
        </div>
        <div className="mt-3"><Btn onClick={() => toast.success(t("Datos guardados", "Details saved"))}>{t("Guardar", "Save")}</Btn></div>
      </Panel>
      <Panel title={t("Mi equipo", "My team")}>
        <Table head={[t("Nombre", "Name"), t("Rol", "Role"), "Email", t("Estado", "State")]}>
          {franchiseTeam.map((m) => <tr key={m.name}><td className="font-medium">{m.name}</td><td>{lang === "es" ? m.role : m.roleEn}</td><td className="text-muted-foreground">{m.email}</td><td><Pill tone={m.state === "Activo" ? "green" : "amber"}>{m.state === "Activo" ? t("Activo", "Active") : t("Invitado", "Invited")}</Pill></td></tr>)}
        </Table>
      </Panel>
      <div className="lg:col-span-2"><OpeningChecklist /></div>
    </div>
  );
}
