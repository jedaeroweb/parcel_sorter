"use client";

import { useEffect, useRef, useState } from "react";
import { initGame } from "@/lib/initGame";
import { useTranslations } from "next-intl";

export default function Game() {
const [gameStarted, setGameStarted] = useState(false);
const [isPortrait, setIsPortrait] = useState(false);
const [gameOver, setGameOver] = useState(false);
const canvasRef = useRef<HTMLCanvasElement>(null);
const gameRef = useRef<any>(null);
const [paused, setPaused] = useState(false);
const t = useTranslations("Game");
const homeT = useTranslations("Home");

useEffect(() => {
  const update = () => {
    setIsPortrait(window.innerHeight > window.innerWidth);
  };

  update();

  window.addEventListener("resize", update);

  return () => window.removeEventListener("resize", update);
}, []);

useEffect(() => {
  if (!gameStarted) return;

  const canvas = canvasRef.current;
  if (!canvas) return;

gameRef.current = initGame(
  canvas,
  () => {
    setGameOver(true);
  },
  t
);

  return () => {
    gameRef.current?.destroy();
  };
}, [gameStarted]);


if (gameStarted && isPortrait) {
  return (
    <div className="flex h-[600px] items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="text-6xl">📱</div>

        <h2 className="text-2xl font-bold">
          가로로 돌려주세요
        </h2>
      </div>
    </div>
  );
}



if (!gameStarted) {
  return (
    <div className="flex h-[600px] items-center justify-center">
      {isPortrait ? (
        <div className="text-center space-y-6">
          <div className="text-6xl">📱</div>

          <h2 className="text-2xl font-bold">
            {homeT("rotateToPlay")}
          </h2>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            {homeT("title")}
          </h1>

          <button
            onClick={() => setGameStarted(true)}
            className="
              rounded-xl
              bg-sky-600
              px-8
              py-4
              text-xl
              text-white
              hover:bg-sky-700
              transition
            "
          >
            ▶ {homeT("play")}
          </button>
        </div>
      )}
    </div>
  );
}


return (

  
  <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black">
<canvas
    ref={canvasRef}
    width={1000}
    height={400}
    className="touch-none"
/>

{!paused && (
<button
  onClick={() => {
    gameRef.current?.pause();
    setPaused(true);
  }}
  className="
    absolute left-4 top-4 z-40
    text-white
    hover:text-yellow-300
    hover:scale-110
    active:scale-95
    transition-all
    drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]
  "
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
  </svg>
</button>
)}

{paused && !gameOver && (
<div
  className="
    absolute inset-0
    z-30
    flex cursor-pointer items-center justify-center
    bg-black/45
    backdrop-blur-[2px]
    select-none
  "
  onClick={() => {
    gameRef.current?.resume();
    setPaused(false);
  }}
>
<div className="text-center group">
  <div
    className="
      text-7xl
      text-white

      transition-all
      duration-150

      group-hover:text-yellow-300
      group-hover:scale-110

      drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]
    "
  >
    ▶
  </div>

  <p
    className="
      mt-4
      text-xl
      font-semibold
      text-white
      transition-colors
      duration-150
      group-hover:text-yellow-300
    "
  >
    {t("resume")}
  </p>

  <p className="mt-2 text-sm text-gray-300">
    {t("clickAnywhereToResume")}
  </p>
</div>
</div>
)}

    {gameOver && (
      <div
        className="
          absolute inset-0
          flex items-center justify-center
          bg-black/60
          z-10
        "
      >
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-red-500">
             {t("gameOver")}
          </h1>

          <button
            onClick={() => {
              setGameOver(false);
              setGameStarted(false);

              requestAnimationFrame(() => {
                setGameStarted(true);
              });
            }}
            className="
              rounded-xl
              bg-sky-600
              px-8
              py-4
              text-xl
              text-white
              hover:bg-sky-700
              transition
            "
          >
            ▶ {t("restart")}
          </button>
        </div>
      </div>
    )}
  </div>
);
}