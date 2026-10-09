import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "sm" | "owner" | "bishop" | "franchise";
export type Lang = "es" | "en";

// Owner's verdict on a deliverable SM handed in. Kept app-wide so it survives navigation.
export type Review = { review: "pending" | "accepted" | "rework"; note?: string };

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  t: (es: string, en: string) => string;
  reviews: Record<string, Review>;
  setReview: (deliverableId: string, r: Review) => void;
  // Which small business the "owner" role is looking at (one in program, one already a franchisor).
  ownerBusiness: string;
  setOwnerBusiness: (id: string) => void;
  // Current manual version published by each franchisor; franchises compare their copy against it.
  manualVersions: Record<string, string>;
  publishManual: (businessId: string, version: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("sm");
  const [lang, setLang] = useState<Lang>("es");
  const [dark, setDark] = useState(false);

  const [ownerBusiness, setOwnerBusiness] = useState("vossler");

  useEffect(() => {
    const r = localStorage.getItem("sm-role") as Role | null;
    const l = localStorage.getItem("sm-lang") as Lang | null;
    const o = localStorage.getItem("sm-owner");
    if (r) setRole(r);
    if (l) setLang(l);
    if (o) setOwnerBusiness(o);
    if (localStorage.getItem("sm-dark") === "1") setDark(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("sm-role", role);
    localStorage.setItem("sm-lang", lang);
    localStorage.setItem("sm-owner", ownerBusiness);
    localStorage.setItem("sm-dark", dark ? "1" : "0");
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = lang;
  }, [role, lang, dark, ownerBusiness]);

  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const setReview = (id: string, r: Review) => setReviews((prev) => ({ ...prev, [id]: r }));
  const [manualVersions, setManualVersions] = useState<Record<string, string>>({ bimbo: "v1.3" });
  const publishManual = (businessId: string, version: string) => setManualVersions((prev) => ({ ...prev, [businessId]: version }));

  const t = (es: string, en: string) => (lang === "es" ? es : en);
  return <Ctx.Provider value={{ role, setRole, lang, setLang, dark, setDark, t, reviews, setReview, ownerBusiness, setOwnerBusiness, manualVersions, publishManual }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

export const ROLE_HOME: Record<Role, string> = { sm: "/", owner: "/dueno", bishop: "/bishop", franchise: "/franquicia" };
