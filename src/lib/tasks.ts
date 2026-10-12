// Program tasks instantiated from the official Método 180 catalog (src/data/Catalogo_Metodo180.json).
// Every task keeps the catalog code, name and acceptance criterion; nothing is invented here.
import catalogJson from "@/data/Catalogo_Metodo180.json";
import { TODAY, type AreaId } from "./config";
import { businesses, getBusiness } from "./mock-data";

export type Priority = "minimo" | "alto_valor" | "opcional" | "tercero" | "fuera";
export interface CatalogItem { code: string; area: AreaId; name: string; owner: string; support: string; applies: string; priority: Priority; base: boolean; acceptance: string; exclusion: string }
export const CATALOG = catalogJson as unknown as CatalogItem[];

export interface Firm { id: string; name: string; area: AreaId; internal: boolean; contact: string; email: string }
export const FIRMS: Firm[] = [
  { id: "sm-estr", name: "SM Estrategia (Miami)", area: "estr", internal: true, contact: "Marylin Boraei", email: "marylin@strategicmates.com" },
  { id: "opslab", name: "OpsLab Consulting", area: "proc", internal: false, contact: "Andrea Ruiz", email: "andrea@opslab.co" },
  { id: "delta", name: "Delta Contadores", area: "fin", internal: false, contact: "Marcos Lin", email: "marcos@deltacpa.com" },
  { id: "tecnopyme", name: "TecnoPyme", area: "tec", internal: false, contact: "Sofía Castro", email: "sofia@tecnopyme.io" },
  { id: "xyz", name: "Agencia XYZ", area: "marca", internal: false, contact: "Valeria Soto", email: "valeria@agenciaxyz.com" },
  { id: "perez", name: "Estudio Pérez Legal", area: "legal", internal: false, contact: "Julián Pérez", email: "julian@perezlegal.com" },
];
export const getFirm = (id: string | null | undefined) => FIRMS.find((f) => f.id === id);
export const firmForArea = (area: AreaId) => FIRMS.find((f) => f.area === area)!;

export type TaskStatus = "planned" | "progress" | "delivered" | "changes" | "redelivered" | "accepted" | "overdue" | "third";
export type Party = "firm" | "owner" | "sm";
export interface Msg { from: string; party: Party; at: string; text: string }
export interface OwnerRequest { id: string; text: string; at: string; resolved: boolean }
export interface Meeting { at: string; status: "proposed" | "confirmed" }
export interface HistoryItem { at: string; es: string; en: string; note?: string }
export interface Task {
  id: string; business: string; code: string; name: string; area: AreaId; priority: Priority; acceptance: string;
  firm: string | null; responsible: string; step: number; due: string; status: TaskStatus; attachments: string[];
  deliveryNote?: string; changesNote?: string; thread: Msg[]; requests: OwnerRequest[]; meeting?: Meeting; history: HistoryItem[];
}

const DAY = 86400000;
export const addDays = (iso: string, n: number) => new Date(new Date(iso + "T12:00:00Z").getTime() + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a: string, b: string) => Math.round((new Date(b + "T12:00:00Z").getTime() - new Date(a + "T12:00:00Z").getTime()) / DAY);
export const daysLeft = (due: string) => daysBetween(TODAY, due);

// Per-business choices SM made on the catalog: high-value items removed and optional ones switched on.
const SELECTION: Record<string, { removed?: string[]; optional?: string[] }> = {
  vossler: { optional: ["B5-10"], removed: ["B5-07"] },
  prime10: { removed: ["B1-07"] },
  cleanpro: { optional: ["B5-09"] },
  bimbo: {},
  enyermy: { removed: ["B5-07", "B5-08"] },
};
const PROGRAM_BIZ = Object.keys(SELECTION);

const OPEN: TaskStatus[] = ["planned", "progress", "delivered", "changes", "redelivered", "overdue"];
export const isOpen = (t: Task) => OPEN.includes(t.status);
export const waitingOwner = (t: Task) => t.status === "delivered" || t.status === "redelivered";

function stepFor(s: TaskStatus, i: number) {
  return { planned: 0, progress: i % 2 ? 1 : 2, delivered: 3, changes: 2, redelivered: 3, accepted: 4, overdue: 2, third: 0 }[s];
}

function statusFor(left: number, i: number, franchisor: boolean): TaskStatus {
  if (franchisor) return "accepted";
  if (left < -14) return i % 6 === 2 ? "overdue" : "accepted";
  if (left < 0) return (["delivered", "changes", "redelivered", "overdue"] as const)[i % 4]!;
  if (left <= 21) return (["progress", "delivered", "planned"] as const)[i % 3]!;
  return "planned";
}

function historyFor(t: Task, start: string): HistoryItem[] {
  const h: HistoryItem[] = [{ at: start, es: `Asignada a ${getFirm(t.firm)?.name ?? "SM"}`, en: `Assigned to ${getFirm(t.firm)?.name ?? "SM"}` }];
  if (t.status === "planned") return h;
  h.push({ at: addDays(start, 3), es: "En proceso", en: "In progress" });
  if (["delivered", "changes", "redelivered", "accepted"].includes(t.status)) h.push({ at: addDays(t.due, -4), es: "Entregada", en: "Delivered" });
  if (t.status === "changes" || t.status === "redelivered") h.push({ at: addDays(t.due, -2), es: "Cambios pedidos", en: "Changes requested", note: t.changesNote ?? "" });
  if (t.status === "redelivered") h.push({ at: addDays(t.due, 1), es: "Reentregada", en: "Redelivered" });
  if (t.status === "accepted") h.push({ at: addDays(t.due, -1), es: "Aceptada por el dueño", en: "Accepted by the owner" });
  return h;
}

// Hand-written conversation for the tasks people actually talk about. Key: business:code.
const STORIES: Record<string, Partial<Task> & { status?: TaskStatus }> = {
  "vossler:B5-01": {
    status: "changes", changesNote: "Me gusta el enfoque, pero la propuesta habla de \"remodelaciones\" y nosotros hacemos casas nuevas. Corrijan eso antes de seguir.",
    thread: [
      { from: "Valeria Soto", party: "firm", at: "2026-10-01", text: "Daniel, te subo la propuesta de valor con tres variantes de mensaje. La B es la que mejor probó con los clientes que entrevistamos." },
      { from: "Daniel Vossler", party: "owner", at: "2026-10-03", text: "Me gusta el enfoque, pero la propuesta habla de \"remodelaciones\" y nosotros hacemos casas nuevas. Corrijan eso antes de seguir." },
      { from: "Marylin Boraei", party: "sm", at: "2026-10-03", text: "Valeria, ojo que el blueprint define obra nueva llave en mano como la unidad franquiciable. Usá esa frase." },
    ],
    requests: [{ id: "rq1", text: "Fotos de las últimas cinco obras terminadas, en alta", at: "2026-10-06", resolved: false }],
    meeting: { at: "2026-10-14T10:00", status: "proposed" },
  },
  "vossler:B5-13": {
    status: "progress", thread: [{ from: "Valeria Soto", party: "firm", at: "2026-10-05", text: "Estamos armando el diagnóstico de marca. ¿Tenés los archivos originales del logo o solo el PNG de la web?" }],
    requests: [{ id: "rq2", text: "Archivos originales del logo (AI, SVG o PDF vectorial)", at: "2026-10-05", resolved: false }],
  },
  "vossler:B6-01": {
    status: "redelivered", changesNote: "Falta la póliza de responsabilidad civil en el data room.",
    thread: [
      { from: "Julián Pérez", party: "firm", at: "2026-10-02", text: "Subimos el data room con la matriz de readiness. Quedan dos ítems en amarillo, los marqué." },
      { from: "Daniel Vossler", party: "owner", at: "2026-10-04", text: "Falta la póliza de responsabilidad civil en el data room." },
      { from: "Julián Pérez", party: "firm", at: "2026-10-07", text: "Agregada la póliza vigente hasta marzo 2027. Reentregado." },
    ],
  },
  "vossler:B6-03": {
    status: "overdue", thread: [{ from: "Julián Pérez", party: "firm", at: "2026-10-06", text: "Estamos frenados: sin el número de licencia del condado no podemos cerrar el mapa regulatorio." }],
    requests: [{ id: "rq3", text: "Número de licencia de contratista del condado de Orange", at: "2026-09-28", resolved: false }, { id: "rq4", text: "Permiso de ocupación de la oficina", at: "2026-09-20", resolved: true }],
  },
  "prime10:B6-02": {
    status: "delivered", deliveryNote: "Recomendamos mantener la LLC y abrir una nueva entidad para franquiciar. El detalle está en el anexo 2.",
    thread: [{ from: "Julián Pérez", party: "firm", at: "2026-10-07", text: "Carla, entregamos la evaluación societaria. Cuando la leas, agendemos 30 minutos para explicarte la recomendación." }],
    meeting: { at: "2026-10-13T15:00", status: "proposed" },
  },
  "prime10:B6-06": {
    status: "progress", requests: [{ id: "rq5", text: "Lista de dominios web y redes sociales a nombre de la empresa", at: "2026-10-08", resolved: false }],
  },
  "enyermy:B5-13": {
    status: "progress", thread: [{ from: "Valeria Soto", party: "firm", at: "2026-10-07", text: "Enyermy, nos vemos el martes en el salón para tomar fotos del local y ver cómo usan la marca hoy." }],
    meeting: { at: "2026-10-13T11:00", status: "confirmed" },
    requests: [{ id: "rq6", text: "Acceso de administrador a Instagram del salón", at: "2026-10-08", resolved: false }],
  },
  "enyermy:B6-01": { status: "progress", requests: [{ id: "rq7", text: "Artículos de organización de la LLC", at: "2026-10-07", resolved: false }] },
  "cleanpro:B5-06": {
    status: "delivered", deliveryNote: "Proceso comercial documentado con tiempos de respuesta objetivo: 2 h hábiles para leads web.",
    thread: [{ from: "Valeria Soto", party: "firm", at: "2026-10-06", text: "Sofía, el proceso ya está cargado en el CRM. Probalo con el equipo esta semana y contanos." }],
  },
  "cleanpro:B6-16": { status: "overdue", thread: [{ from: "Marylin Boraei", party: "sm", at: "2026-10-08", text: "Julián, esto ya está una semana atrasado y bloquea el cierre. ¿Qué falta?" }, { from: "Julián Pérez", party: "firm", at: "2026-10-08", text: "Falta la firma del tercer socio. Le escribí ayer, sigo detrás." }] },
  "vossler:B1-02": { status: "progress", requests: [{ id: "rq8", text: "Presupuesto de ventas 2027 por tipo de casa", at: "2026-10-07", resolved: false }] },
};

function generate(): Task[] {
  const out: Task[] = [];
  for (const bid of PROGRAM_BIZ) {
    const b = getBusiness(bid)!;
    const sel = SELECTION[bid]!;
    const start = addDays(TODAY, -((b.day ?? 1) - 1));
    const franchisor = b.stage === "franchisor";
    for (const area of b.areas ?? []) {
      if (area.skipped) continue;
      const items = CATALOG.filter((c) => c.area === area.area && c.priority !== "fuera"
        && !(c.priority === "alto_valor" && sel.removed?.includes(c.code))
        && !(c.priority === "opcional" && !sel.optional?.includes(c.code)));
      items.forEach((c, i) => {
        const due = addDays(start, 15 + Math.round(((i + 1) * 135) / items.length));
        const third = c.priority === "tercero";
        const firm = third ? null : firmForArea(c.area);
        const story = STORIES[`${bid}:${c.code}`];
        const status: TaskStatus = third ? "third" : story?.status ?? statusFor(daysLeft(due), i, franchisor);
        const t: Task = {
          id: `${bid}-${c.code}`, business: bid, code: c.code, name: c.name, area: c.area, priority: c.priority, acceptance: c.acceptance,
          firm: firm?.id ?? null, responsible: firm?.contact ?? "—", step: stepFor(status, i),
          due: story?.status === "overdue" && daysLeft(due) >= 0 ? addDays(TODAY, -3) : due, status,
          attachments: ["delivered", "changes", "redelivered", "accepted"].includes(status) ? [`${c.code}_v1.pdf`, ...(status === "redelivered" ? [`${c.code}_v2.pdf`] : [])] : [],
          thread: story?.thread ?? [], requests: story?.requests ?? [], history: [],
          ...(story?.meeting ? { meeting: story.meeting } : {}),
          ...(story?.changesNote ? { changesNote: story.changesNote } : status === "changes" ? { changesNote: "Revisen el criterio de aceptación: falta el punto principal." } : {}),
          ...(story?.deliveryNote ? { deliveryNote: story.deliveryNote } : {}),
        };
        t.history = historyFor(t, start);
        out.push(t);
      });
    }
  }
  return out;
}

export const INITIAL_TASKS = generate();
export const programBusinesses = () => businesses.filter((b) => PROGRAM_BIZ.includes(b.id));

export const STATUS_LABEL: Record<TaskStatus, { es: string; en: string; tone: "grey" | "navy" | "amber" | "red" | "green" | "gold" }> = {
  planned: { es: "Planificada", en: "Planned", tone: "grey" },
  progress: { es: "En proceso", en: "In progress", tone: "navy" },
  delivered: { es: "Esperando al dueño", en: "Waiting for owner", tone: "amber" },
  changes: { es: "Cambios pedidos", en: "Changes requested", tone: "red" },
  redelivered: { es: "Reentregada", en: "Redelivered", tone: "amber" },
  accepted: { es: "Aceptada", en: "Accepted", tone: "green" },
  overdue: { es: "Vencida", en: "Overdue", tone: "red" },
  third: { es: "En manos de tercero", en: "With third party", tone: "gold" },
};

// Days late for an open task past due (0 otherwise).
export const lateDays = (t: Task) => (isOpen(t) && daysLeft(t.due) < 0 ? -daysLeft(t.due) : 0);
export const dueThisWeek = (t: Task) => isOpen(t) && daysLeft(t.due) >= 0 && daysLeft(t.due) <= 7;
