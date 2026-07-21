import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations  } from "next-intl/server";
import Script from "next/script";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "Home",
  });

const ogLocale = {
  ko: "ko_KR",
  en: "en_GB",
  ja: "ja_JP",
  zh: "zh_CN",

  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
}[locale] ?? "en_GB";

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },

    description: t("description"),

  alternates: {
    languages: {
      ko: "/ko",
      en: "/en",
      ja: "/ja",
      zh: "/zh",

      fr: "/fr",
      es: "/es",
      de: "/de",
    },
  },

    icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },

  manifest: "/site.webmanifest",

  applicationName: "parcel_sorter",

    openGraph: {
      type: "website",
      siteName: t("title"),
      locale: ogLocale,
    },
  };
}


export default async function LocaleLayout({
children,
params,
}: {
children: React.ReactNode;
params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  const isProduction = process.env.NODE_ENV === "production";

  return (
      <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Header />

            <main className="flex-1">
              {children}
            </main>

            <Footer />
          </NextIntlClientProvider>

          {isProduction && (
            <>
            <Script
              async
              strategy="afterInteractive"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5400903051441488"
              crossOrigin="anonymous"
            />
<Script async src="https://www.googletagmanager.com/gtag/js?id=G-NHX5BKH9KT"></Script>
<Script id="google-analytics" strategy="afterInteractive"> {` window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', 'G-NHX5BKH9KT'); `} </Script>
</>
          )}
        </Providers>
      </body>
    </html>
  );
}