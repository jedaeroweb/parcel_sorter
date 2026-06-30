import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Home");
  return (
    
    <header className="bg-zinc-800 shadow-lg">

      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        <Link
          href="/"
          className="text-2xl font-bold text-yellow-400"
        >
          📦 {t("title")}
        </Link>

        <nav className="flex gap-6">

          <Link href="/"> {t("play")} </Link>

          <Link href="/how-to-play">
            {t("how-to-play")}
          </Link>

          <Link href="/tips">
            {t("tips")}
          </Link>

        </nav>

      </div>

    </header>
  );
}