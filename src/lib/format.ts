export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const fdate = (iso: string, lang: "es" | "en" = "es") => {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(lang === "es" ? "es-AR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
};
