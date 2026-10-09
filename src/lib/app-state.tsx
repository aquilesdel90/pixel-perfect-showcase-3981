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
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("sm");
  const [lang, setLang] = useState<Lang>("es");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const r = localStorage.getItem("sm-role") as Role | null;
    const l = localStorage.getItem("sm-lang") as Lang | null;
    if (r) setRole(r);
    if (l) setLang(l);
    if (localStorage.getItem("sm-dark") === "1") setDark(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("sm-role", role);
    localStorage.setItem("sm-lang", lang);
    localStorage.setItem("sm-dark", dark ? "1" : "0");
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = lang;
  }, [role, lang, dark]);

  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const setReview = (id: string, r: Review) => setReviews((prev) => ({ ...prev, [id]: r }));

  const t = (es: string, en: string) => (lang === "es" ? es : en);
  return <Ctx.Provider value={{ role, setRole, lang, setLang, dark, setDark, t, reviews, setReview }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

export const ROLE_HOME: Record<Role, string> = { sm: "/", owner: "/dueno", bishop: "/bishop", franchise: "/franquicia" };
