import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { CURRENT } from "@/lib/config";
import { pageHead } from "@/lib/head";
import { ManualView } from "@/components/sm/sections";

export const Route = createFileRoute("/dueno/manual")({
  head: pageHead("Mi manual", "El manual de procesos que SM documenta y el dueño aprueba sección por sección."),
  component: OwnerManual,
});

function OwnerManual() {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("Esto es lo que SM está documentando de tu negocio. Cada sección se aprueba cuando vos confirmás que así se trabaja. Es el producto que después compra el franquiciado.", "This is what SM is documenting about your business. Each section is approved once you confirm that is how work gets done. It is the product a franchisee later buys.")}
      </p>
      <ManualView businessId={CURRENT.ownerBusiness} canApprove />
    </div>
  );
}
