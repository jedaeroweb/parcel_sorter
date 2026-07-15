"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Home");

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-700 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-yellow-400"
            onClick={() => setMenuOpen(false)}
          >
            📦 {t("title")}
          </Link>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex gap-6">
            <Link href="/">{t("play")}</Link>

            <Link href="/rankings">
              {t("rankings")}
            </Link>

            <Link href="/how-to-play">
              {t("how-to-play")}
            </Link>
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button
            className="md:hidden text-3xl"
            onClick={() => setMenuOpen(true)}
            aria-label="menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* 어두운 배경 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 슬라이드 메뉴 */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-72
          bg-white dark:bg-zinc-900
          shadow-2xl z-50
          transform transition-transform duration-300
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex justify-end p-4">
          <button
            className="text-3xl"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col px-8 py-4 gap-6 text-lg">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            {t("play")}
          </Link>

          <Link href="/rankings" onClick={() => setMenuOpen(false)}>
            {t("rankings")}
          </Link>

          <Link href="/how-to-play" onClick={() => setMenuOpen(false)}>
            {t("how-to-play")}
          </Link>
        </nav>
      </aside>
    </>
  );
}