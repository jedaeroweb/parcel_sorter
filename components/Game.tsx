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

      <div className="rounded-xl overflow-hidden shadow-2xl bg-black">

          <canvas
              ref={canvasRef}
              width={1000}
              height={400}
          />

      </div>

  );

}