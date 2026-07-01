"use client";

import { useEffect, useRef } from "react";
import { initGame } from "@/lib/initGame";

export default function Game() {

  const canvasRef =
      useRef<HTMLCanvasElement>(null);

  useEffect(() => {

      if (!canvasRef.current) return;

      const destroy =
          initGame(canvasRef.current);

      return destroy;

  }, []);

  return (

      <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xl border border-slate-200 dark:border-zinc-700">

          <canvas
              ref={canvasRef}
              width={1000}
              height={400}
          />

      </div>

  );

}