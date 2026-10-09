// Program template — names and day ranges are placeholders; edit here.
export const PROGRAM = {
  totalDays: 180,
  gates: {
    diagnostico: { es: "Diagnóstico", en: "Diagnosis", start: 1, end: 15 },
    cierre: { es: "Cierre franquiciable", en: "Franchisable close", start: 150, end: 180 },
  },
  areas: [
    { id: "fin", es: "Finanzas", en: "Finance", start: 15, end: 150, validate: "Tres cierres mensuales seguidos sin ajustes manuales y flujo de caja proyectado a 90 días.", validateEn: "Three consecutive monthly closes without manual adjustments and a 90-day cash flow projection." },
    { id: "proc", es: "Procesos", en: "Processes", start: 15, end: 150, validate: "El equipo opera dos semanas con los procedimientos nuevos sin intervención del dueño.", validateEn: "The team runs two weeks on the new procedures without the owner stepping in." },
    { id: "marca", es: "Marca y marketing", en: "Brand & marketing", start: 15, end: 150, validate: "Marca registrable, manual de marca aprobado y plan comercial con presupuesto.", validateEn: "Registrable brand, approved brand manual and a budgeted sales plan." },
    { id: "legal", es: "Legal y equipo", en: "Legal & team", start: 15, end: 150, validate: "Licencias y contratos vigentes, organigrama con un alterno por puesto clave.", validateEn: "Licenses and contracts in force, org chart with a backup for every key role." },
  ],
  steps: [
    { es: "Relevar", en: "Survey" },
    { es: "Diseñar", en: "Design" },
    { es: "Implementar", en: "Implement" },
    { es: "Validar", en: "Validate" },
    { es: "Documentar", en: "Document" },
  ],
} as const;

export type AreaId = (typeof PROGRAM.areas)[number]["id"];

export const FRANCHISABILITY_THRESHOLD = 85;

export const FEES = { royalty: 0.05, marketing: 0.03, smShareOfRoyalty: 0.3 };

// Profit split — not final, treated as a parameter.
export const PROFIT_SPLIT = { bishopYear1: 0.5, bishopStabilized: 0.22, smFromYear2: 0.1 };

export const ASSESSMENT = {
  questions: 47,
  areas: ["Finanzas", "Procesos", "Estructura", "Ventas", "Personas", "Tecnología", "Gestión", "Cumplimiento"],
  levels: [
    { level: "M1", min: 0 },
    { level: "M2", min: 25 },
    { level: "M3", min: 45 },
    { level: "M4", min: 65 },
    { level: "M5", min: 85 },
  ],
  versions: [
    { v: "v3", date: "2026-08-12", by: "Aquiles Benítez", note: "Pesos de Finanzas 1.2x", current: true },
    { v: "v2", date: "2026-03-02", by: "Aquiles Benítez", note: "Se agregan 5 preguntas de Cumplimiento", current: false },
    { v: "v1", date: "2025-11-18", by: "Aquiles Benítez", note: "Versión inicial", current: false },
  ],
};

export const TODAY = "2026-10-09";

// Who is "logged in" when switching roles in the prototype.
export const CURRENT = { ownerBusiness: "vossler", franchise: "bimbo-orl", bishop: "Jefferson Paula" };
