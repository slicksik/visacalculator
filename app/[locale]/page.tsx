import { redirect } from "next/navigation";
import { isLocale, Locale, slugs } from "@/lib/i18n";

type PageParams = {
  params: {
    locale: string;
  };
};

export default function LocaleIndexPage({ params }: PageParams) {
  if (!isLocale(params.locale)) {
    redirect(`/en/${slugs.en}`);
  }
  const locale = params.locale as Locale;
  redirect(`/${locale}/${slugs[locale]}`);
}
