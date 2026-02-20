import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultLocale, isLocale } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Greece Golden Visa Calculator",
  description: "Calculate your total investment costs for Greek residency by investment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeCookie = cookies().get("NEXT_LOCALE")?.value;
  const locale = isLocale(localeCookie) ? localeCookie : defaultLocale;

  return (
    <html lang={locale}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
