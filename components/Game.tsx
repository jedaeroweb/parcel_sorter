"use client";

import { useEffect, useRef, useState } from "react";
import { initGame } from "@/lib/initGame";

export default function Game() {
const [gameStarted, setGameStarted] = useState(false);
const [isPortrait, setIsPortrait] = useState(false);
const [gameOver, setGameOver] = useState(false);
const canvasRef = useRef<HTMLCanvasElement>(null);

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
  if (!canvasRef.current) return;

  const destroy = initGame(
    canvasRef.current,
    () => setGameOver(true)
  );

  return destroy;
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
            가로로 돌려주세요
          </h2>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            Conveyor
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
            ▶ 게임 시작
          </button>
        </div>
      )}
    </div>
  );
}


  return (

      <div className="rounded-xl overflow-hidden shadow-2xl bg-black">

          <canvas
              ref={canvasRef}
              width={1000}
              height={400}
          />

    {gameOver && (
      <div
        className="
          absolute inset-0
          flex items-center justify-center
          bg-black/60
        "
      >
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-red-500">
            GAME OVER
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
            ▶ 다시하기
          </button>
        </div>
      </div>
    )}

      </div>

  );

}