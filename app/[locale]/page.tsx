import { redirect } from "next/navigation";
import { isLocale, Locale, slugs } from "@/lib/i18n";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleIndexPage({ params }: PageParams) {
  const resolved = await params;
  if (!isLocale(resolved.locale)) {
    redirect(`/en/${slugs.en}`);
  }
  const locale = resolved.locale as Locale;
  redirect(`/${locale}/${slugs[locale]}`);
}
