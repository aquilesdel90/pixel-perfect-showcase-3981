import { useApp } from "@/lib/app-state";
import type { DelivStatus, Stage } from "@/lib/mock-data";
import { Pill } from "./ui";

export function StagePill({ stage }: { stage: Stage }) {
  const { t } = useApp();
  const m = {
    evaluated: ["grey", t("Evaluado", "Evaluated")],
    approved: ["gold", t("Aprobado", "Approved")],
    program: ["navy", t("En programa", "In program")],
    franchisor: ["green", t("Franquiciadora", "Franchisor")],
    discarded: ["red", t("Descartado", "Discarded")],
  } as const;
  const [tone, label] = m[stage];
  return <Pill tone={tone}>{label}</Pill>;
}

export function DelivPill({ status }: { status: DelivStatus }) {
  const { t } = useApp();
  const m = {
    planned: ["grey", t("Planificado", "Planned")],
    progress: ["navy", t("En curso", "In progress")],
    delivered: ["green", t("Entregado", "Delivered")],
    overdue: ["red", t("Vencido", "Overdue")],
    owner: ["amber", t("Pendiente del dueño", "Pending from owner")],
  } as const;
  const [tone, label] = m[status];
  return <Pill tone={tone}>{label}</Pill>;
}

export function DocPill({ state }: { state: string }) {
  const { t } = useApp();
  const m: Record<string, [NonNullable<Parameters<typeof Pill>[0]["tone"]>, string]> = {
    requested: ["amber", t("Solicitado", "Requested")],
    received: ["navy", t("Recibido", "Received")],
    reviewed: ["green", t("Revisado", "Reviewed")],
    signed: ["green", t("Firmado", "Signed")],
    sent: ["amber", t("Enviado a firma", "Sent for signature")],
    draft: ["grey", t("Borrador", "Draft")],
    open: ["red", t("Abierto", "Open")],
    answered: ["amber", t("Respondido", "Answered")],
    closed: ["grey", t("Cerrado", "Closed")],
    operating: ["green", t("Operando", "Operating")],
    opening: ["amber", t("En apertura", "Opening")],
  };
  const [tone, label] = m[state] ?? ["grey", state];
  return <Pill tone={tone}>{label}</Pill>;
}
