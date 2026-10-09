import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { getBusiness } from "@/lib/mock-data";
import { NumbersView } from "@/components/sm/sections";

export const Route = createFileRoute("/dueno/numeros")({
  head: pageHead("Mis números", "Finanzas del negocio y qué cambió desde que empezó el programa."),
  component: OwnerNumbers,
});

function OwnerNumbers() {
  const { t, ownerBusiness } = useApp();
  const franchisor = getBusiness(ownerBusiness)?.stage === "franchisor";
  return (
    <div className="space-y-4">
      <NumbersView businessId={ownerBusiness} />
      <p className="text-xs text-muted-foreground">
        {franchisor
          ? t("Son los números de tu negocio propio. Lo que cobrás de las franquicias está en Mi franquiciadora.", "These are your own business numbers. What you collect from franchises is under My franchisor.")
          : t("Ves tus propios números y lo que SM te comenta. El reparto con el Business Bishop se muestra recién cuando SM te lo presenta.", "You see your own numbers and SM's comments. The split with the Business Bishop is shown only once SM presents it to you.")}
      </p>
    </div>
  );
}
