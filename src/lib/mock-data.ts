import type { AreaId } from "./config";

export type Stage = "evaluated" | "approved" | "program" | "franchisor" | "discarded";
export type DelivStatus = "planned" | "progress" | "delivered" | "overdue" | "owner";

export const team = [
  { id: "mb", name: "Marylin Boraei", role: "Directora", roleEn: "Director", access: "Admin", email: "marylin@strategicmates.com" },
  { id: "ng", name: "Nicolás García", role: "Consultor de procesos", roleEn: "Process consultant", access: "Consultor", email: "nicolas@strategicmates.com" },
  { id: "ab", name: "Aquiles Benítez", role: "Superadmin de plataforma", roleEn: "Platform superadmin", access: "Superadmin", email: "aquiles@strategicmates.com" },
];

export interface AreaState {
  area: AreaId;
  step: number; // 0..4 current step; 5 = done
  progress: number;
  responsible: string;
  ownerNext: string;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  city: string;
  owner: string;
  revenue: number;
  maturity: number;
  level: string;
  stage: Stage;
  consultant: string;
  day?: number;
  franchisability?: number;
  bishop?: string;
  assessmentVersion: string;
  areas?: AreaState[];
}

const a = (area: AreaId, step: number, progress: number, responsible: string, ownerNext: string): AreaState => ({
  area, step, progress, responsible, ownerNext,
});

export const businesses: Business[] = [
  {
    id: "vossler", name: "Vossler", industry: "Construcción residencial", city: "Orlando", owner: "Daniel Vossler",
    revenue: 1850000, maturity: 59, level: "M3", stage: "program", consultant: "Nicolás García", day: 74,
    franchisability: 58, assessmentVersion: "v3",
    areas: [
      a("fin", 2, 55, "Marylin Boraei", "Subir estados de cuenta de agosto"),
      a("proc", 2, 48, "Nicolás García", "Revisar mapa de procesos de obra"),
      a("marca", 1, 32, "Marylin Boraei", "Aprobar propuesta de logo"),
      a("legal", 3, 71, "Aquiles Benítez", "Firmar acuerdo de confidencialidad del equipo"),
    ],
  },
  {
    id: "prime10", name: "Prime 10 Solutions", industry: "Remodelación", city: "Tampa", owner: "Carla Méndez",
    revenue: 920000, maturity: 51, level: "M3", stage: "program", consultant: "Nicolás García", day: 31,
    franchisability: 34, assessmentVersion: "v3",
    areas: [
      a("fin", 1, 22, "Marylin Boraei", "Enviar acceso a QuickBooks"),
      a("proc", 0, 15, "Nicolás García", "Agendar entrevista con jefe de cuadrilla"),
      a("marca", 0, 10, "Marylin Boraei", "Completar cuestionario de marca"),
      a("legal", 1, 25, "Aquiles Benítez", "Subir licencia de contratista"),
    ],
  },
  {
    id: "enyermy", name: "Enyermy Hair Studio", industry: "Salón de belleza", city: "Miami", owner: "Enyermy Rojas",
    revenue: 410000, maturity: 44, level: "M2", stage: "program", consultant: "Marylin Boraei", day: 6,
    franchisability: 18, assessmentVersion: "v3",
    areas: [
      a("fin", 0, 0, "Marylin Boraei", "—"),
      a("proc", 0, 0, "Nicolás García", "—"),
      a("marca", 0, 0, "Marylin Boraei", "—"),
      a("legal", 0, 0, "Aquiles Benítez", "—"),
    ],
  },
  {
    id: "bimbo", name: "Bimbo Tacos", industry: "Restaurante", city: "Orlando", owner: "Rodrigo Bimbo",
    revenue: 1240000, maturity: 78, level: "M4", stage: "franchisor", consultant: "Nicolás García", day: 180,
    franchisability: 91, bishop: "Jefferson Paula", assessmentVersion: "v2",
    areas: [
      a("fin", 5, 100, "Marylin Boraei", "—"),
      a("proc", 5, 100, "Nicolás García", "—"),
      a("marca", 5, 100, "Marylin Boraei", "—"),
      a("legal", 5, 100, "Aquiles Benítez", "—"),
    ],
  },
  { id: "melany", name: "Melany 001", industry: "Boutique de ropa", city: "Kissimmee", owner: "Melany Torres", revenue: 380000, maturity: 63, level: "M3", stage: "approved", consultant: "Marylin Boraei", assessmentVersion: "v3" },
  { id: "carwash", name: "LLc Car Wash", industry: "Lavado de autos", city: "Jacksonville", owner: "Pedro Alvarado", revenue: 560000, maturity: 41, level: "M2", stage: "evaluated", consultant: "Nicolás García", assessmentVersion: "v3" },
  { id: "ramirez", name: "Taller Ramírez", industry: "Taller mecánico", city: "Hialeah", owner: "Jorge Ramírez", revenue: 210000, maturity: 22, level: "M1", stage: "discarded", consultant: "Marylin Boraei", assessmentVersion: "v2" },
];

export const getBusiness = (id: string) => businesses.find((b) => b.id === id);

export interface Deliverable {
  id: string; business: string; area: AreaId | "diag" | "cierre"; name: string; responsible: string;
  start: string; due: string; status: DelivStatus; attachments: number;
}

export const deliverables: Deliverable[] = [
  { id: "d1", business: "vossler", area: "diag", name: "Informe de diagnóstico", responsible: "Nicolás García", start: "2026-07-28", due: "2026-08-11", status: "delivered", attachments: 2 },
  { id: "d2", business: "vossler", area: "diag", name: "Cuenta de Google Workspace", responsible: "Aquiles Benítez", start: "2026-07-28", due: "2026-08-04", status: "delivered", attachments: 0 },
  { id: "d3", business: "vossler", area: "fin", name: "Separación de cuentas y QuickBooks", responsible: "Marylin Boraei", start: "2026-08-12", due: "2026-09-15", status: "delivered", attachments: 3 },
  { id: "d4", business: "vossler", area: "fin", name: "Estados financieros verificados", responsible: "Marylin Boraei", start: "2026-09-01", due: "2026-10-20", status: "progress", attachments: 1 },
  { id: "d5", business: "vossler", area: "fin", name: "Estados de cuenta agosto", responsible: "Daniel Vossler", start: "2026-09-20", due: "2026-10-05", status: "owner", attachments: 0 },
  { id: "d6", business: "vossler", area: "proc", name: "Mapa de procesos: ventas", responsible: "Nicolás García", start: "2026-08-12", due: "2026-09-10", status: "delivered", attachments: 1 },
  { id: "d7", business: "vossler", area: "proc", name: "Mapa de procesos: obra", responsible: "Nicolás García", start: "2026-09-05", due: "2026-10-02", status: "overdue", attachments: 1 },
  { id: "d8", business: "vossler", area: "proc", name: "Procedimiento de compras", responsible: "Nicolás García", start: "2026-10-01", due: "2026-11-05", status: "planned", attachments: 0 },
  { id: "d9", business: "vossler", area: "marca", name: "Auditoría de marca", responsible: "Marylin Boraei", start: "2026-08-15", due: "2026-09-20", status: "delivered", attachments: 2 },
  { id: "d10", business: "vossler", area: "marca", name: "Propuesta de identidad visual", responsible: "Marylin Boraei", start: "2026-09-21", due: "2026-10-15", status: "progress", attachments: 3 },
  { id: "d11", business: "vossler", area: "legal", name: "Estructura LLC y operating agreement", responsible: "Aquiles Benítez", start: "2026-08-12", due: "2026-09-12", status: "delivered", attachments: 2 },
  { id: "d12", business: "vossler", area: "legal", name: "Registro de marca (USPTO)", responsible: "Aquiles Benítez", start: "2026-09-15", due: "2026-11-30", status: "progress", attachments: 1 },
  { id: "d13", business: "vossler", area: "cierre", name: "Manual de operaciones v1", responsible: "Nicolás García", start: "2027-01-08", due: "2027-02-05", status: "planned", attachments: 0 },
  { id: "d14", business: "prime10", area: "fin", name: "Separación de cuentas y QuickBooks", responsible: "Marylin Boraei", start: "2026-09-23", due: "2026-10-25", status: "progress", attachments: 0 },
  { id: "d15", business: "prime10", area: "legal", name: "Licencia de contratista", responsible: "Carla Méndez", start: "2026-09-23", due: "2026-10-06", status: "overdue", attachments: 0 },
  { id: "d16", business: "enyermy", area: "diag", name: "Informe de diagnóstico", responsible: "Marylin Boraei", start: "2026-10-04", due: "2026-10-18", status: "progress", attachments: 0 },
  { id: "d17", business: "enyermy", area: "diag", name: "Cuenta de Google Workspace", responsible: "Aquiles Benítez", start: "2026-10-04", due: "2026-10-09", status: "progress", attachments: 0 },
  { id: "d18", business: "prime10", area: "diag", name: "Informe de diagnóstico", responsible: "Nicolás García", start: "2026-09-09", due: "2026-09-23", status: "delivered", attachments: 1 },
  { id: "d19", business: "prime10", area: "proc", name: "Entrevistas con jefes de cuadrilla", responsible: "Nicolás García", start: "2026-10-01", due: "2026-10-20", status: "progress", attachments: 0 },
  { id: "d20", business: "prime10", area: "marca", name: "Cuestionario de marca", responsible: "Carla Méndez", start: "2026-09-25", due: "2026-10-12", status: "owner", attachments: 0 },
  { id: "d21", business: "enyermy", area: "diag", name: "Plan del programa y MOU", responsible: "Marylin Boraei", start: "2026-10-10", due: "2026-10-18", status: "planned", attachments: 0 },
];

// Day 1 of each program. Used by the Gantt and the "today" marker instead of a hardcoded date.
export const programStart: Record<string, string> = { vossler: "2026-07-27", prime10: "2026-09-09", enyermy: "2026-10-04", bimbo: "2025-03-02" };

export const manualSections = (businessId: string) => {
  const base = [
    { id: "ventas", name: "Ventas", pct: 80, approved: true },
    { id: "operacion", name: "Operación", pct: 55, approved: false },
    { id: "compras", name: "Compras", pct: 30, approved: false },
    { id: "atencion", name: "Atención al cliente", pct: 65, approved: false },
    { id: "admin", name: "Administración", pct: 45, approved: false },
    { id: "personas", name: "Personas", pct: 20, approved: false },
  ];
  if (businessId === "bimbo") return base.map((s) => ({ ...s, pct: 100, approved: true }));
  if (businessId !== "vossler") return base.map((s) => ({ ...s, pct: Math.round(s.pct / 4), approved: false }));
  return base;
};

export const documents = [
  { id: "doc1", business: "vossler", name: "Estados financieros 2025", state: "reviewed", date: "2026-08-02" },
  { id: "doc2", business: "vossler", name: "Licencia de contratista FL", state: "reviewed", date: "2026-08-03" },
  { id: "doc3", business: "vossler", name: "Contratos con proveedores", state: "received", date: "2026-09-18" },
  { id: "doc4", business: "vossler", name: "Estados de cuenta agosto", state: "requested", date: "2026-09-20" },
  { id: "doc5", business: "vossler", name: "Póliza de seguro general", state: "requested", date: "2026-10-01" },
  { id: "doc6", business: "prime10", name: "Licencia de contratista", state: "requested", date: "2026-09-23" },
];

export const contracts = [
  { id: "c1", business: "vossler", name: "NDA", state: "signed", date: "2026-07-20" },
  { id: "c2", business: "vossler", name: "MOU programa 180 días", state: "signed", date: "2026-07-27" },
  { id: "c3", business: "vossler", name: "Acuerdo con Bishop", state: "draft", date: "—" },
  { id: "c4", business: "bimbo", name: "Acuerdo con Bishop — Jefferson Paula", state: "signed", date: "2025-11-14" },
  { id: "c5", business: "bimbo", name: "MOU programa 180 días", state: "signed", date: "2025-03-02" },
  { id: "c6", business: "prime10", name: "MOU programa 180 días", state: "sent", date: "2026-09-08" },
];

export const financials = {
  vossler: {
    months: ["May", "Jun", "Jul", "Ago", "Sep"],
    revenue: [142000, 151000, 148000, 163000, 171000],
    margin: [11, 12, 12, 14, 16],
    cash: [38000, 41000, 36000, 52000, 61000],
    changes: [
      { metric: "Margen neto", before: "11%", now: "16%" },
      { metric: "Cuentas separadas", before: "No", now: "Sí" },
      { metric: "Días de cobro", before: "54", now: "38" },
      { metric: "Horas semanales del dueño en obra", before: "52", now: "34" },
      { metric: "Procesos documentados", before: "0 de 6", now: "2 de 6" },
    ],
  },
};

export const franchises = [
  { id: "bimbo-orl", franchisor: "bimbo", name: "Bimbo Tacos Orlando Sur", buyer: "Luisa Paredes", opening: "2026-04-15", status: "operating" as const, standards: 88, manualVersion: "v1.3",
    sales: [{ m: "May", v: 61000 }, { m: "Jun", v: 68000 }, { m: "Jul", v: 72000 }, { m: "Ago", v: 70500 }, { m: "Sep", v: 75200 }] },
  { id: "bimbo-tpa", franchisor: "bimbo", name: "Bimbo Tacos Tampa", buyer: "Marco Ibáñez", opening: "2026-11-20", status: "opening" as const, standards: 0, manualVersion: "v1.3", sales: [] as { m: string; v: number }[] },
];

export const openingChecklist = [
  { item: "Contrato de franquicia firmado", done: true },
  { item: "Local aprobado por SM", done: true },
  { item: "Permisos municipales", done: true },
  { item: "Equipamiento de cocina instalado", done: false },
  { item: "Capacitación del equipo (40 h)", done: false },
  { item: "Auditoría de apertura", done: false },
];

export const standards = [
  { item: "Recetas según manual", ok: true },
  { item: "Uniforme y presentación", ok: true },
  { item: "Limpieza de cocina (checklist diario)", ok: true },
  { item: "Tiempos de servicio < 8 min", ok: false },
  { item: "Señalética de marca", ok: true },
  { item: "Registro de temperaturas", ok: false },
];

export const tickets = [
  { id: "T-118", franchise: "bimbo-orl", subject: "Proveedor de tortillas sin stock", state: "open", date: "2026-10-07" },
  { id: "T-112", franchise: "bimbo-orl", subject: "Duda sobre promoción de octubre", state: "answered", date: "2026-10-02" },
  { id: "T-104", franchise: "bimbo-orl", subject: "Falla en POS", state: "closed", date: "2026-09-21" },
  { id: "T-120", franchise: "bimbo-tpa", subject: "Planos de cocina para inspección", state: "open", date: "2026-10-08" },
];

export const services = [
  { name: "Diagnóstico integral", phase: "Diagnóstico", deliverables: "Informe, mapa de madurez", price: 3500 },
  { name: "Separación de cuentas y QuickBooks", phase: "Finanzas", deliverables: "Cuentas, plan contable", price: 2800 },
  { name: "Estados financieros verificados", phase: "Finanzas", deliverables: "P&L, balance, flujo", price: 4200 },
  { name: "Mapa de procesos: ventas", phase: "Procesos", deliverables: "BPMN, procedimiento", price: 1900 },
  { name: "Mapa de procesos: operación", phase: "Procesos", deliverables: "BPMN, procedimiento", price: 2400 },
  { name: "Identidad visual", phase: "Marca y marketing", deliverables: "Logo, manual de marca", price: 3800 },
  { name: "Registro de marca", phase: "Legal y equipo", deliverables: "Solicitud USPTO", price: 1500 },
  { name: "Manual de operaciones v1", phase: "Cierre franquiciable", deliverables: "Manual completo", price: 9500 },
  { name: "FDD y paquete de franquicia", phase: "Cierre franquiciable", deliverables: "FDD, contrato", price: 12000 },
];

export type EventKind = "meeting" | "due" | "client";
export const events = [
  { id: "e1", day: 0, start: 9, dur: 1, title: "Revisión de finanzas", business: "vossler", member: "mb", kind: "meeting" as EventKind, meet: true },
  { id: "e2", day: 0, start: 14, dur: 1.5, title: "Kickoff diagnóstico", business: "enyermy", member: "mb", kind: "meeting" as EventKind, meet: true },
  { id: "e3", day: 1, start: 10, dur: 2, title: "Relevamiento de obra", business: "vossler", member: "ng", kind: "meeting" as EventKind, meet: false },
  { id: "e4", day: 1, start: 12, dur: 1, title: "Almuerzo con proveedor", business: "vossler", member: "", kind: "client" as EventKind, meet: false },
  { id: "e5", day: 2, start: 11, dur: 1, title: "Workshop de procesos", business: "prime10", member: "ng", kind: "meeting" as EventKind, meet: true },
  { id: "e6", day: 2, start: 16, dur: 1, title: "Comité de franquicias", business: "bimbo", member: "mb", kind: "meeting" as EventKind, meet: true },
  { id: "e7", day: 3, start: 9.5, dur: 1, title: "Alta de Google Workspace", business: "enyermy", member: "ab", kind: "meeting" as EventKind, meet: true },
  { id: "e8", day: 3, start: 15, dur: 1, title: "Visita a cliente", business: "prime10", member: "", kind: "client" as EventKind, meet: false },
  { id: "e9", day: 4, start: 10, dur: 1, title: "Propuesta de marca", business: "vossler", member: "mb", kind: "meeting" as EventKind, meet: true },
  { id: "e10", day: 4, start: 0, dur: 0, title: "Vence: Workspace Enyermy", business: "enyermy", member: "ab", kind: "due" as EventKind, meet: false },
  { id: "e11", day: 0, start: 0, dur: 0, title: "Vence: Estados de cuenta agosto", business: "vossler", member: "mb", kind: "due" as EventKind, meet: false },
];
export const WEEK = ["Lun 5", "Mar 6", "Mié 7", "Jue 8", "Vie 9", "Sáb 10", "Dom 11"];
export const WEEK_EN = ["Mon 5", "Tue 6", "Wed 7", "Thu 8", "Fri 9", "Sat 10", "Sun 11"];

export const bishop = {
  name: "Jefferson Paula",
  investments: [{ business: "bimbo", invested: 150000, share: 22, date: "2025-11-14", recovered: 41800, paybackMonth: "Mar 2029" }],
  recovery: {
    months: ["Dic", "Feb", "Abr", "Jun", "Ago", "Oct", "Dic", "Feb", "Abr"],
    projected: [0, 6000, 13000, 21000, 30000, 40000, 51000, 63000, 76000],
    real: [0, 5200, 12800, 22400, 32100, 41800],
  },
  opportunities: [
    { business: "vossler", status: "En preparación", investment: 150000, share: 20 },
    { business: "prime10", status: "En preparación", investment: 150000, share: 25 },
  ],
};

export const activity = [
  { date: "2026-10-08", who: "Nicolás García", text: "Subió borrador del mapa de procesos de obra" },
  { date: "2026-10-06", who: "Daniel Vossler", text: "Aprobó la sección Ventas del manual" },
  { date: "2026-10-03", who: "Marylin Boraei", text: "Nota: el dueño todavía firma todos los cheques; trabajar delegación" },
  { date: "2026-09-29", who: "Aquiles Benítez", text: "Envió NDA del equipo por DocuSeal" },
];

export const ownerTeam = [
  { name: "Daniel Vossler", role: "Dueño", email: "daniel@vosslerbuild.com", state: "Activo" },
  { name: "Ana Vossler", role: "Administración", email: "ana@vosslerbuild.com", state: "Activo" },
  { name: "Luis Prado", role: "Jefe de obra", email: "luis@vosslerbuild.com", state: "Invitado" },
];

// Franchisability score components, derived from area progress and manual completion
// so every business gets its own numbers (the criteria themselves are still a draft).
export const franchisabilityBreakdown = (b: Business) => {
  const p = (id: AreaId) => b.areas?.find((x) => x.area === id)?.progress ?? 0;
  const manual = Math.round(manualSections(b.id).reduce((s, x) => s + x.pct, 0) / 6);
  return [
    { es: "Manual completo", en: "Manual completion", v: manual },
    { es: "Finanzas verificadas", en: "Verified finances", v: p("fin") },
    { es: "Opera sin el dueño", en: "Runs without the owner", v: Math.round(p("proc") * 0.9) },
    { es: "Cumplimiento", en: "Compliance", v: p("legal") },
    { es: "Marca registrable", en: "Registrable brand", v: p("marca") },
  ];
};

// What the Bishop sees in an opportunity sheet. Numbers are illustrative.
export const opportunityDetail: Record<string, {
  es: string; en: string; investment: number; shareYear1: number; shareStable: number; ready: string;
  projection: { year: number; franchises: number; revenue: number; result: number; bishop: number }[];
}> = {
  vossler: {
    es: "Construcción residencial con 9 años de operación, 14 empleados y 2 cuadrillas. Finanzas ordenadas desde agosto. El manual está al 49% y la marca necesita rediseño para ser registrable.",
    en: "Residential construction, 9 years in business, 14 employees and 2 crews. Finances cleaned up since August. Manual at 49% and the brand needs a redesign to be registrable.",
    investment: 150000, shareYear1: 20, shareStable: 14, ready: "2027-01-23",
    projection: [
      { year: 1, franchises: 4, revenue: 320000, result: 110000, bishop: 55000 },
      { year: 2, franchises: 10, revenue: 760000, result: 270000, bishop: 54000 },
      { year: 3, franchises: 18, revenue: 1300000, result: 490000, bishop: 69000 },
      { year: 4, franchises: 26, revenue: 1900000, result: 720000, bishop: 101000 },
      { year: 5, franchises: 35, revenue: 2600000, result: 980000, bishop: 137000 },
    ],
  },
  prime10: {
    es: "Remodelación residencial en Tampa, 6 años, 9 empleados. Entró al programa hace un mes; todavía sin finanzas verificadas.",
    en: "Residential remodeling in Tampa, 6 years, 9 employees. Joined the program a month ago; finances not yet verified.",
    investment: 150000, shareYear1: 25, shareStable: 16, ready: "2027-03-08",
    projection: [
      { year: 1, franchises: 3, revenue: 210000, result: 70000, bishop: 35000 },
      { year: 2, franchises: 8, revenue: 540000, result: 190000, bishop: 47000 },
      { year: 3, franchises: 14, revenue: 950000, result: 350000, bishop: 56000 },
      { year: 4, franchises: 20, revenue: 1400000, result: 520000, bishop: 83000 },
      { year: 5, franchises: 28, revenue: 1950000, result: 740000, bishop: 118000 },
    ],
  },
};

export const bishopAgreements = [
  { id: "ba1", name: "Acuerdo de participación — Bimbo Tacos", nameEn: "Equity agreement — Bimbo Tacos", with: "Rodrigo Bimbo, Strategic Mates", state: "signed", date: "2025-11-14" },
  { id: "ba2", name: "NDA Business Bishop", nameEn: "Business Bishop NDA", with: "Strategic Mates", state: "signed", date: "2025-10-30" },
  { id: "ba3", name: "Acuerdo de participación — Vossler", nameEn: "Equity agreement — Vossler", with: "—", state: "draft", date: "—" },
];

export const franchiseTasks = [
  { id: "ft1", es: "Enviar reporte de ventas de octubre", en: "Send October sales report", due: "2026-11-05" },
  { id: "ft2", es: "Preparar auditoría de estándares del 22 oct", en: "Prepare the Oct 22 standards audit", due: "2026-10-22" },
  { id: "ft3", es: "Leer manual v1.3, sección Compras (cambió el 28 sep)", en: "Read manual v1.3, Purchasing section (changed Sep 28)", due: "2026-10-15" },
];

export const franchiseTeam = [
  { name: "Luisa Paredes", role: "Dueña", roleEn: "Owner", email: "luisa@bimbotacos.com", state: "Activo" },
  { name: "Tomás Reyes", role: "Encargado de turno", roleEn: "Shift manager", email: "tomas@bimbotacos.com", state: "Activo" },
  { name: "Equipo de cocina", role: "Operación", roleEn: "Operations", email: "—", state: "Invitado" },
];
