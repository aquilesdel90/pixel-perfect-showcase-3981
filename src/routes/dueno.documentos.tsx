import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { CURRENT } from "@/lib/config";
import { pageHead } from "@/lib/head";
import { DocumentsView } from "@/components/sm/sections";

export const Route = createFileRoute("/dueno/documentos")({
  head: pageHead("Documentos", "Documentos que el dueño sube y contratos que firma."),
  component: OwnerDocuments,
});

function OwnerDocuments() {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      <DocumentsView businessId={CURRENT.ownerBusiness} owner />
      <p className="text-xs text-muted-foreground">
        {t("Lo que SM te entrega (mapas, manuales, planes) aparece en Mi manual cuando lo apruebes. Los contratos se firman por DocuSeal desde el mail que recibís.", "What SM delivers (maps, manuals, plans) shows up in My manual once you approve it. Contracts are signed through DocuSeal from the email you receive.")}
      </p>
    </div>
  );
}
