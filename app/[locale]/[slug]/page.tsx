import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GreeceGoldenVisaCalculator from "@/components/GreeceGoldenVisaCalculator";
import { descriptions, isLocale, Locale, slugs, titles } from "@/lib/i18n";

const SITE_URL = "https://visacalculator-two.vercel.app";

type PageParams = {
  params: {
    locale: string;
    slug: string;
  };
};

export function generateStaticParams() {
  return Object.entries(slugs).map(([locale, slug]) => ({
    locale,
    slug,
  }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const expectedSlug = slugs[locale];
  if (params.slug !== expectedSlug) return {};

  const path = `/${locale}/${expectedSlug}`;
  return {
    title: titles[locale],
    description: descriptions[locale],
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        en: `${SITE_URL}/en/${slugs.en}`,
        tr: `${SITE_URL}/tr/${slugs.tr}`,
        el: `${SITE_URL}/el/${slugs.el}`,
      },
    },
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      url: `${SITE_URL}${path}`,
      locale: locale === "el" ? "el_GR" : locale === "tr" ? "tr_TR" : "en_US",
    },
  };
}

export default function LocalizedCalculatorPage({ params }: PageParams) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  if (params.slug !== slugs[locale]) notFound();

  return <GreeceGoldenVisaCalculator />;
}
