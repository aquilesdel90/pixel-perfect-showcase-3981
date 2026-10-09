import { createFileRoute } from "@tanstack/react-router";
import { FileSignature } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { fdate } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { bishopAgreements } from "@/lib/mock-data";
import { DocPill } from "@/components/sm/status";
import { Panel } from "@/components/sm/ui";

export const Route = createFileRoute("/bishop/acuerdos")({
  head: pageHead("Mis acuerdos", "Acuerdos del Business Bishop firmados por DocuSeal."),
  component: Agreements,
});

function Agreements() {
  const { t, lang } = useApp();
  return (
    <Panel title={t("Acuerdos (DocuSeal)", "Agreements (DocuSeal)")}>
      <ul className="divide-y">
        {bishopAgreements.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-3">
              <FileSignature className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{lang === "es" ? a.name : a.nameEn}</div>
                <div className="text-xs text-muted-foreground">{t("Con", "With")}: {a.with} · {fdate(a.date, lang)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DocPill state={a.state} />
              {a.state === "signed" && <button className="text-xs text-primary hover:underline">PDF</button>}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">{t("El acuerdo de Vossler se genera cuando el negocio llegue al umbral y vos confirmes interés.", "The Vossler agreement is generated once the business reaches the threshold and you confirm interest.")}</p>
    </Panel>
  );
}
