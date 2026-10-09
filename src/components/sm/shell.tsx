import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Briefcase, Building2, CalendarDays, FileText, Filter, Home, Layers, Menu, Moon, Receipt, Settings,
  Store, Sun, User, Users, BookOpen, Handshake, Wallet, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ROLE_HOME, useApp, type Role } from "@/lib/app-state";
import { getBusiness } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type NavItem = { to: string; es: string; en: string; icon: typeof Home; exact?: boolean };

const NAV: Record<Role, NavItem[]> = {
  sm: [
    { to: "/", es: "Embudo", en: "Funnel", icon: Filter, exact: true },
    { to: "/negocios", es: "Negocios", en: "Businesses", icon: Building2 },
    { to: "/franquicias", es: "Franquicias", en: "Franchises", icon: Store },
    { to: "/calendario", es: "Calendario", en: "Calendar", icon: CalendarDays },
    { to: "/catalogo", es: "Catálogo y equipo", en: "Catalog & team", icon: Layers },
    { to: "/configuracion", es: "Configuración", en: "Settings", icon: Settings },
    { to: "/perfil", es: "Mi perfil", en: "My profile", icon: User },
  ],
  owner: [
    { to: "/dueno", es: "Mi programa", en: "My program", icon: Home, exact: true },
    { to: "/calendario", es: "Calendario", en: "Calendar", icon: CalendarDays },
    { to: "/dueno/manual", es: "Mi manual", en: "My manual", icon: BookOpen },
    { to: "/dueno/documentos", es: "Documentos", en: "Documents", icon: FileText },
    { to: "/dueno/numeros", es: "Mis números", en: "My numbers", icon: BarChart3 },
    { to: "/dueno/negocio", es: "Mi negocio", en: "My business", icon: Users },
  ],
  bishop: [
    { to: "/bishop", es: "Mi portafolio", en: "My portfolio", icon: Briefcase, exact: true },
    { to: "/bishop/oportunidades", es: "Oportunidades", en: "Opportunities", icon: Store },
    { to: "/bishop/acuerdos", es: "Mis acuerdos", en: "My agreements", icon: Handshake },
  ],
  franchise: [
    { to: "/franquicia", es: "Inicio", en: "Home", icon: Home, exact: true },
    { to: "/franquicia/manual", es: "Manual", en: "Manual", icon: BookOpen },
    { to: "/franquicia/pagos", es: "Pagos", en: "Payments", icon: Receipt },
    { to: "/franquicia/negocio", es: "Mi franquicia", en: "My franchise", icon: Wallet },
  ],
};

const EXTRA_TITLES: { prefix: string; es: string; en: string }[] = [
  { prefix: "/negocios/", es: "Programa", en: "Program" },
  { prefix: "/franquicias/", es: "Detalle de franquicia", en: "Franchise detail" },
  { prefix: "/bishop/oportunidades/", es: "Ficha de oportunidad", en: "Opportunity sheet" },
];

// The owner role has two sample users: a small business in the program and one that already franchised.
const ROLES: { key: string; id: Role; biz?: string; es: string; en: string; who: string }[] = [
  { key: "sm", id: "sm", es: "Equipo SM", en: "SM team", who: "Marylin Boraei" },
  { key: "owner:vossler", id: "owner", biz: "vossler", es: "Small Business · Vossler (en programa)", en: "Small Business · Vossler (in program)", who: "Daniel Vossler · Vossler" },
  { key: "owner:bimbo", id: "owner", biz: "bimbo", es: "Small Business · Bimbo Tacos (franquiciadora)", en: "Small Business · Bimbo Tacos (franchisor)", who: "Rodrigo Bimbo · Bimbo Tacos" },
  { key: "bishop", id: "bishop", es: "Business Bishop", en: "Business Bishop", who: "Jefferson Paula" },
  { key: "franchise", id: "franchise", es: "Franquiciado", en: "Franchise owner", who: "Luisa Paredes · Bimbo Orlando Sur" },
];

// A franchisor's menu replaces "Mi programa" with the franchisor home and adds its franchises.
const FRANCHISOR_NAV: NavItem[] = [
  { to: "/dueno", es: "Mi franquiciadora", en: "My franchisor", icon: Home, exact: true },
  { to: "/dueno/franquicias", es: "Mis franquicias", en: "My franchises", icon: Store },
  { to: "/calendario", es: "Calendario", en: "Calendar", icon: CalendarDays },
  { to: "/dueno/manual", es: "Mi manual", en: "My manual", icon: BookOpen },
  { to: "/dueno/documentos", es: "Documentos", en: "Documents", icon: FileText },
  { to: "/dueno/numeros", es: "Mis números", en: "My numbers", icon: BarChart3 },
  { to: "/dueno/negocio", es: "Mi negocio", en: "My business", icon: Users },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, lang, setLang, dark, setDark, t, ownerBusiness, setOwnerBusiness } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const ownerIsFranchisor = role === "owner" && getBusiness(ownerBusiness)?.stage === "franchisor";
  const items = ownerIsFranchisor ? FRANCHISOR_NAV : NAV[role];

  const extra = EXTRA_TITLES.find((e) => path.startsWith(e.prefix));
  const match = [...items].sort((a, b) => b.to.length - a.to.length).find((i) => (i.exact ? path === i.to : path.startsWith(i.to)));
  const title = extra ? extra[lang] : match ? match[lang] : "SM Platform";
  const currentKey = role === "owner" ? `owner:${ownerBusiness}` : role;
  const current = ROLES.find((r) => r.key === currentKey) ?? ROLES[0]!;
  const pick = (key: string) => {
    const r = ROLES.find((x) => x.key === key);
    if (!r) return;
    setRole(r.id);
    if (r.biz) setOwnerBusiness(r.biz);
    navigate({ to: ROLE_HOME[r.id] });
  };

  const rail = (
    <nav className="flex h-full flex-col bg-rail text-rail-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-rail-active px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gold font-display text-xs font-bold text-gold-foreground">SM</div>
        <div className="font-display text-sm font-semibold leading-tight">Strategic Mates<div className="text-[10px] font-medium tracking-[0.12em] text-gold uppercase">Platform</div></div>
      </div>
      <div className="flex-1 space-y-0.5 p-2">
        {items.map((i) => (
          <Link key={i.to} to={i.to} activeOptions={{ exact: !!i.exact }} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-rail-muted transition-colors hover:bg-rail-active hover:text-rail-foreground data-[status=active]:bg-rail-active data-[status=active]:text-rail-foreground data-[status=active]:shadow-[inset_3px_0_0_var(--color-gold)]">
            <i.icon className="h-4 w-4" />{i[lang]}
          </Link>
        ))}
      </div>
      <div className="border-t border-rail-active p-3 text-xs text-rail-muted">
        <div className="text-rail-foreground">{current.who}</div>
        <div>{role === "owner" ? (ownerIsFranchisor ? t("Small Business · Franquiciadora", "Small Business · Franchisor") : t("Small Business · En programa", "Small Business · In program")) : current[lang]}</div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 md:block">{rail}</aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-60">{rail}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 shadow-[inset_0_-2px_0_var(--color-gold)]">
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="truncate font-display text-base font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <select aria-label={t("Rol", "Role")} value={currentKey} onChange={(e) => pick(e.target.value)}
              className="h-8 max-w-[260px] rounded-md border bg-card px-2 text-sm">
              {ROLES.map((r) => <option key={r.key} value={r.key}>{r[lang]}</option>)}
            </select>
            <div className="flex overflow-hidden rounded-md border text-xs">
              {(["es", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1.5 uppercase", lang === l ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{l}</button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} aria-label="Theme" className="rounded-md border p-1.5 hover:bg-muted">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
