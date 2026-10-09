import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { CURRENT, PROGRAM, type AreaId } from "@/lib/config";
import { getBusiness } from "@/lib/mock-data";
import { AreaDetail } from "@/components/sm/area-detail";

export const Route = createFileRoute("/dueno/area/$area")({
  loader: async ({ params }) => {
    const area = PROGRAM.areas.find((a) => a.id === params.area);
    if (!area) throw notFound();
    return { area: area.id as AreaId, name: area.es };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Área"} — Mi programa — SM Platform` },
      { name: "description", content: "Acciones, documentos y firmas de un área del programa, vistas por el dueño." },
    ],
  }),
  component: OwnerArea,
  notFoundComponent: () => <div className="p-6">Área no encontrada. <Link to="/dueno" className="text-primary underline">Volver</Link></div>,
});

function OwnerArea() {
  const { area } = Route.useLoaderData();
  const { t } = useApp();
  const b = getBusiness(CURRENT.ownerBusiness)!;
  return (
    <div className="space-y-3">
      <Link to="/dueno" className="text-sm text-muted-foreground hover:text-foreground">← {t("Mi programa", "My program")}</Link>
      <AreaDetail b={b} areaId={area} role="owner" />
    </div>
  );
}
