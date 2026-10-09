import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { pageHead } from "@/lib/head";
import { NumbersView } from "@/components/sm/sections";

export const Route = createFileRoute("/dueno/numeros")({
  head: pageHead("Mis números", "Finanzas del negocio y qué cambió desde que empezó el programa."),
  component: OwnerNumbers,
});

function OwnerNumbers() {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      <NumbersView />
      <p className="text-xs text-muted-foreground">
        {t("Ves tus propios números y lo que SM te comenta. El reparto con el Business Bishop se muestra recién cuando SM te lo presenta.", "You see your own numbers and SM's comments. The split with the Business Bishop is shown only once SM presents it to you.")}
      </p>
    </div>
  );
}
