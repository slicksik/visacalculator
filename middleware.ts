import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, getLocaleFromPathname } from "./lib/i18n";

export function middleware(request: NextRequest) {
  const localeFromPath = getLocaleFromPathname(request.nextUrl.pathname);
  const locale = localeFromPath ?? defaultLocale;

  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
