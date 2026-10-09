import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { getBusiness, ownerTeam, ownerTeams } from "@/lib/mock-data";
import { Btn, Panel, Pill, Table } from "@/components/sm/ui";

export const Route = createFileRoute("/dueno/negocio")({
  head: pageHead("Mi negocio", "Datos del negocio y usuarios del equipo con acceso al portal."),
  component: OwnerBusiness,
});

function OwnerBusiness() {
  const { t, ownerBusiness } = useApp();
  const b = getBusiness(ownerBusiness)!;
  const [members, setMembers] = useState(ownerTeams[b.id] ?? ownerTeam);
  const [invite, setInvite] = useState("");
  const sendInvite = () => {
    if (!invite.includes("@")) {
      toast.error(t("Escribí un email válido", "Enter a valid email"));
      return;
    }
    setMembers([...members, { name: invite.split("@")[0] ?? invite, role: t("Por definir", "To define"), email: invite, state: "Invitado" }]);
    setInvite("");
    toast.success(t("Invitación enviada", "Invitation sent"));
  };
  const fields: [string, string][] = [
    [t("Negocio", "Business"), b.name], [t("Rubro", "Industry"), b.industry], [t("Ciudad", "City"), `${b.city}, FL`],
    [t("Dueño", "Owner"), b.owner], ["Email", members[0]?.email ?? ""], [t("Teléfono", "Phone"), "+1 (407) 555-0188"],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("Datos del negocio", "Business details")}>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {fields.map(([k, v]) => (
            <label key={k} className="grid gap-1"><span className="text-xs text-muted-foreground">{k}</span><input defaultValue={v} className="h-8 rounded-md border bg-background px-2" /></label>
          ))}
        </div>
        <div className="mt-3"><Btn onClick={() => toast.success(t("Datos guardados", "Details saved"))}>{t("Guardar", "Save")}</Btn></div>
      </Panel>
      <Panel title={t("Mi equipo en el portal", "My team in the portal")}>
        <Table head={[t("Nombre", "Name"), t("Rol", "Role"), "Email", t("Estado", "State")]}>
          {members.map((m) => <tr key={m.email}><td className="font-medium">{m.name}</td><td>{m.role}</td><td className="text-muted-foreground">{m.email}</td><td><Pill tone={m.state === "Activo" ? "green" : "amber"}>{m.state === "Activo" ? t("Activo", "Active") : t("Invitado", "Invited")}</Pill></td></tr>)}
        </Table>
        <div className="mt-3 flex gap-2">
          <input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder={t("email de alguien de tu equipo", "a teammate's email")} className="h-8 flex-1 rounded-md border bg-background px-2 text-sm" />
          <Btn variant="outline" onClick={sendInvite}>{t("Invitar", "Invite")}</Btn>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("Tu equipo ve el manual y los documentos. Solo vos aprobás secciones y firmás.", "Your team sees the manual and documents. Only you approve sections and sign.")}</p>
      </Panel>
    </div>
  );
}
