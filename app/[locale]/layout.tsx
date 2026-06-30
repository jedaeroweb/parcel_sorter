import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
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
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-zinc-900 text-white">
<NextIntlClientProvider messages={messages}>
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <AdBanner />
        <Footer />
 </NextIntlClientProvider>
  <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5400903051441488"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}