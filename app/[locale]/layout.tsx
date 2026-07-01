import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Script from "next/script";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jedaeroweb.co.kr"),

  title: {
    default: "Conveyor Game",
    template: "%s | Conveyor Game",
  },

  description: "Conveyor puzzle game",

  applicationName: "Conveyor Game",

  keywords: [
    "game",
    "conveyor",
    "puzzle",
    "sorting",
    "brain game",
  ],

  authors: [
    {
      name: "Jedaeroweb",
      url: "https://www.jedaeroweb.co.kr",
    },
  ],

  creator: "Jedaeroweb",

  openGraph: {
    type: "website",
    siteName: "Conveyor Game",
    locale: "ko_KR",
  },

  twitter: {
    card: "summary_large_image",
  },
};


export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="ko" suppressHydrationWarning>
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
            <Script
              async
              strategy="afterInteractive"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5400903051441488"
              crossOrigin="anonymous"
            />
          )}
        </Providers>
      </body>
    </html>
  );
}