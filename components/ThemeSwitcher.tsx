"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        flex items-center justify-center
        w-10 h-10
        rounded-full
        border border-slate-300 dark:border-zinc-700
        bg-white dark:bg-zinc-800
        hover:bg-slate-100 dark:hover:bg-zinc-700
        transition-all duration-300
      "
      aria-label="테마 변경"
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-slate-700" />
      )}
    </button>
  );
}