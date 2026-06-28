import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-zinc-900 text-white">

        <Header />

        <main className="flex-1">
          {children}
        </main>

        <AdBanner />
        <Footer />

      </body>
    </html>
  );
}