export const locales = ["en", "tr", "el"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const slugs: Record<Locale, string> = {
  en: "greece-golden-visa-calculator",
  tr: "yunanistan-altin-vize-hesaplayici",
  el: "elliniko-chryso-visa-ypologistis",
};

export const titles: Record<Locale, string> = {
  en: "Greece Golden Visa Cost Calculator",
  tr: "Yunanistan Altın Vize Maliyet Hesaplayıcı",
  el: "Υπολογιστής Κόστους Χρυσής Βίζας Ελλάδας",
};

export const descriptions: Record<Locale, string> = {
  en: "Estimate total costs for the Greece Golden Visa.",
  tr: "Yunanistan Altın Vize için toplam maliyeti hesaplayın.",
  el: "Υπολογίστε το συνολικό κόστος για τη Χρυσή Βίζα Ελλάδας.",
};

export function isLocale(value?: string): value is Locale {
  if (!value) return false;
  return (locales as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}
