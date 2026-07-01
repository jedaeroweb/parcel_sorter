"use client";

import Link from "next/link";
import { Languages, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Footer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const locale = pathname.split("/")[1] || "ko";

  const langs = [
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  const current = langs.find((l) => l.code === locale) || langs[0];

  return (
<footer className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-700">

  <div
    className="
      mx-auto
      max-w-7xl
      px-6
      py-6

      flex
      flex-col
      gap-4

      md:flex-row
      md:items-center
      md:justify-between
    "
  >

    {/* 왼쪽 : 테마 + 언어 */}
    <div className="flex items-center justify-center gap-3">

      <ThemeSwitcher />

      <div className="relative">

        <button
          onClick={() => setOpen(!open)}
          className="
            flex items-center gap-2
            rounded-full
            border border-slate-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            px-4 py-2
            shadow-sm
            hover:bg-slate-100
            dark:hover:bg-zinc-700
            transition
          "
        >
          <Languages size={18} />
          <span>{current.flag}</span>
          <span>{current.label}</span>
        </button>

        {open && (
          <div
            className="
              absolute
              bottom-12
              left-0
              w-48
              rounded-xl
              border border-slate-200
              dark:border-zinc-700
              bg-white
              dark:bg-zinc-800
              shadow-xl
              overflow-hidden
              z-50
            "
          >
            {langs.map((lang) => (
              <Link
                key={lang.code}
                href={`/${lang.code}`}
                onClick={() => setOpen(false)}
                className="
                  flex items-center justify-between
                  px-4 py-3
                  hover:bg-slate-100
                  dark:hover:bg-zinc-700
                  transition
                "
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  {lang.label}
                </span>

                {locale === lang.code && (
                  <Check size={16} />
                )}
              </Link>
            ))}
          </div>
        )}

      </div>

    </div>

    {/* 오른쪽 : Copyright */}
    <address
      className="
        not-italic
        text-center
        md:text-right
        text-sm
        text-slate-500
        dark:text-zinc-400
      "
    >
      <a
        href="https://www.jedaeroweb.co.kr"
        target="_blank"
        rel="noopener noreferrer"
        className="
          font-semibold
          text-slate-700
          dark:text-white
          hover:text-sky-600
          dark:hover:text-sky-400
        "
      >
        Jedaeroweb
      </a>

      <span className="mx-2">|</span>

      Copyleft © 2020 Jedaeroweb. All wrongs reserved.
    </address>

  </div>

</footer>
  );
}