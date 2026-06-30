import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-700 bg-zinc-900 text-gray-400">

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-6">

        {/* 언어 선택 */}
        <div className="flex items-center gap-3">

          <Link
            href="/ko"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xl transition hover:bg-zinc-700 hover:scale-110"
            title="한국어"
          >
            🇰🇷
          </Link>

          <Link
            href="/en"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xl transition hover:bg-zinc-700 hover:scale-110"
            title="English"
          >
            🇺🇸
          </Link>

          <Link
            href="/ja"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xl transition hover:bg-zinc-700 hover:scale-110"
            title="日本語"
          >
            🇯🇵
          </Link>

        </div>

        {/* Copyright */}
        <address className="not-italic text-center text-sm">

          <a
            href="https://www.jedaeroweb.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-300 hover:text-white"
          >
            Jedaeroweb
          </a>

          <span className="mx-2 text-zinc-600">|</span>

          Copyleft © 2020 Jedaeroweb. All wrongs reserved.

        </address>

      </div>

    </footer>
  );
}