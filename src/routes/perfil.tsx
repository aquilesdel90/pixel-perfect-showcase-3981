import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { Btn, Panel, Pill } from "@/components/sm/ui";
import { NotifPrefs } from "./configuracion";

export const Route = createFileRoute("/perfil")({
  head: pageHead("Mi perfil", "Datos personales, seguridad, 2FA y preferencias de notificación."),
  component: Profile,
});

function Profile() {
  const { t } = useApp();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("Datos", "Details")}>
        <div className="grid gap-3 text-sm">
          {[[t("Nombre", "Name"), "Marylin Boraei"], ["Email", "marylin@strategicmates.com"], [t("Puesto", "Position"), t("Directora", "Director")], [t("Teléfono", "Phone"), "+1 (407) 555-0142"]].map(([k, v]) => (
            <label key={k} className="grid gap-1"><span className="text-xs text-muted-foreground">{k}</span><input defaultValue={v} className="h-8 rounded-md border bg-background px-2" /></label>
          ))}
          <div><Btn>{t("Guardar", "Save")}</Btn></div>
        </div>
      </Panel>
      <Panel title={t("Seguridad", "Security")}>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between"><span>{t("Contraseña", "Password")}</span><Btn variant="outline">{t("Cambiar", "Change")}</Btn></div>
          <div className="flex items-center justify-between"><span>{t("Verificación en dos pasos (2FA)", "Two-factor authentication (2FA)")}</span><Pill tone="green">{t("Activada", "Enabled")}</Pill></div>
          <div className="flex items-center justify-between"><span>{t("Sesiones activas", "Active sessions")}</span><span className="text-muted-foreground">2</span></div>
        </div>
      </Panel>
      <div className="lg:col-span-2"><NotifPrefs /></div>
    </div>
  );
}
