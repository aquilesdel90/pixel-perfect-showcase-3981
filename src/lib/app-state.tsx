import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CURRENT } from "./config";

export type Role = "sm" | "owner" | "bishop" | "franchise" | "partner";
export type Lang = "es" | "en";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  t: (es: string, en: string) => string;
  // Which small business the "owner" role is looking at (one in program, one already a franchisor).
  ownerBusiness: string;
  setOwnerBusiness: (id: string) => void;
  // Which partner firm the "partner" role is logged in as (a firm id from FIRMS in tasks.ts).
  partnerFirm: string;
  setPartnerFirm: (id: string) => void;
  // Current manual version published by each franchisor; franchises compare their copy against it.
  manualVersions: Record<string, string>;
  publishManual: (businessId: string, version: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("sm");
  const [lang, setLang] = useState<Lang>("es");
  const [dark, setDark] = useState(false);

  const [ownerBusiness, setOwnerBusiness] = useState(CURRENT.ownerBusiness);
  const [partnerFirm, setPartnerFirm] = useState(CURRENT.partnerFirm);

  useEffect(() => {
    const r = localStorage.getItem("sm-role") as Role | null;
    const l = localStorage.getItem("sm-lang") as Lang | null;
    const o = localStorage.getItem("sm-owner");
    const f = localStorage.getItem("sm-firm");
    if (r) setRole(r);
    if (l) setLang(l);
    if (o) setOwnerBusiness(o);
    if (f) setPartnerFirm(f);
    if (localStorage.getItem("sm-dark") === "1") setDark(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("sm-role", role);
    localStorage.setItem("sm-lang", lang);
    localStorage.setItem("sm-owner", ownerBusiness);
    localStorage.setItem("sm-firm", partnerFirm);
    localStorage.setItem("sm-dark", dark ? "1" : "0");
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = lang;
  }, [role, lang, dark, ownerBusiness, partnerFirm]);

  const [manualVersions, setManualVersions] = useState<Record<string, string>>({ bimbo: "v1.3" });
  const publishManual = (businessId: string, version: string) => setManualVersions((prev) => ({ ...prev, [businessId]: version }));

  const t = (es: string, en: string) => (lang === "es" ? es : en);
  return <Ctx.Provider value={{ role, setRole, lang, setLang, dark, setDark, t, ownerBusiness, setOwnerBusiness, partnerFirm, setPartnerFirm, manualVersions, publishManual }}>{children}</Ctx.Provider>;
}

// Reads a saved choice straight from the browser. Used when the provider is missing so the screen
// still shows the language and role the person last picked instead of going blank.
function stored<T extends string>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return (v === null ? fallback : (v as T)) as T;
  } catch {
    return fallback;
  }
}

let warned = false;
// A screen that renders without AppProvider (a stale hot-reloaded module, a route outside the shell)
// must degrade to saved defaults, never blank the whole page.
export function useApp() {
  const c = useContext(Ctx);
  if (c) return c;
  if (!warned) {
    warned = true;
    console.warn("useApp sin proveedor: usando los valores guardados. Recargá la página para normalizarlo.");
  }
  const lang = stored<Lang>("sm-lang", "es");
  const noop = () => {};
  return {
    role: stored<Role>("sm-role", "sm"),
    setRole: noop,
    lang,
    setLang: noop,
    dark: stored("sm-dark", "0") === "1",
    setDark: noop,
    t: (es: string, en: string) => (lang === "es" ? es : en),
    ownerBusiness: stored("sm-owner", CURRENT.ownerBusiness),
    setOwnerBusiness: noop,
    partnerFirm: stored("sm-firm", CURRENT.partnerFirm),
    setPartnerFirm: noop,
    manualVersions: {},
    publishManual: noop,
  };
}

export const ROLE_HOME: Record<Role, string> = { sm: "/", owner: "/dueno", bishop: "/bishop", franchise: "/franquicia", partner: "/firma" };
