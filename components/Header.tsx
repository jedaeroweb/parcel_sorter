import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-zinc-800 shadow-lg">

      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        <Link
          href="/"
          className="text-2xl font-bold text-yellow-400"
        >
          📦 Sorter
        </Link>

        <nav className="flex gap-6">

          <Link href="/">Game</Link>

          <Link href="/how-to-play">
            How to Play
          </Link>

          <Link href="/tips">
            Tips
          </Link>

        </nav>

      </div>

    </header>
  );
}