import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Script from "next/script";

export default async function LocaleLayout({
    children
}: {
    children: React.ReactNode;
}) {

    const messages = await getMessages();

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
  <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5400903051441488"
          crossOrigin="anonymous"
        />
        </Providers>
      </body>
    </html>
  );
}