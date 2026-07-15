"use client";

import { useEffect, useRef, useState } from "react";
import { initGame } from "@/lib/initGame";
import { useTranslations } from "next-intl";

export default function Game() {
const [gameStarted, setGameStarted] = useState(false);
const [isPortrait, setIsPortrait] = useState(false);
const [gameOver, setGameOver] = useState(false);
const [stageClear, setStageClear] = useState(false);
const [stageMessage, setStageMessage] = useState("");
const [rankingModal, setRankingModal] =
  useState(false);

const [rankingData, setRankingData] =
  useState<any>(null);

const [nickname, setNickname] =
  useState("");
const [score, setScore] = useState(0);  
  
const canvasRef = useRef<HTMLCanvasElement>(null);
const gameRef = useRef<any>(null);
const [paused, setPaused] = useState(false);
const t = useTranslations("Game");
const homeT = useTranslations("Home");


async function submitRanking() {
  if (!rankingData) {
    return;
  }

  const nicknameToSend =
    nickname.trim() || "Anonymous";

  try {
    const res = await fetch(
      "/api/rankings",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          nickname: nicknameToSend,

          score:
            rankingData.score,

          stage:
            rankingData.stage,

          accuracy:
            rankingData.accuracy,

          playTime:
            rankingData.playTime,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "failed to save ranking"
      );
    }

    setRankingModal(false);
  } catch (err) {
    console.error(err);

    alert(
      "랭킹 등록에 실패했습니다."
    );
  }
}

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

(result) => {
  setRankingData(result);

  setGameOver(true);

  fetch(
    "/api/rankings/can-enter",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        score: result.score,
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.canEnter) {
        setRankingModal(true);
      }
    })
    .catch(console.error);
},

  (message: string) => {
    setStageMessage(message);
    setStageClear(true);
  },

  setPaused,

  t
);

  return () => {
    gameRef.current?.destroy();
  };
}, [gameStarted]);


if (gameStarted && isPortrait) {
  return (
    <div className="flex h-[600px] max-w-[1200px] items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="text-6xl">📱</div>

        <h2 className="text-2xl font-bold">
          {homeT("rotateToPlay")}
        </h2>
      </div>
    </div>
  );
}



if (!gameStarted) {
  return (
    <div className="flex h-[600px] max-w-[1200px] items-center justify-center">
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

  <div
  className="
    relative
    w-full
    max-w-[1200px]
    mx-auto
    rounded-xl
    overflow-hidden
    shadow-2xl
    bg-black
    select-none
    touch-none
    [-webkit-touch-callout:none]
    [-webkit-user-select:none]
  "
>
<canvas
  ref={canvasRef}
  width={1160}
  height={400}
  className="
    touch-none
    block
    w-full
    h-auto
  "
/>


{rankingModal && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
    <div className="rounded-2xl bg-white p-8 text-black w-[360px]">

      <h2 className="mb-4 text-2xl font-bold">
        🏆 TOP 100
      </h2>

      <p>성과: {rankingData.score}</p>

      <p>라인: {rankingData.stage}</p>

      <p>정확도: {rankingData.accuracy}%</p>

      <input
        className="mt-4 w-full border p-2"
        maxLength={20}
        value={nickname}
        onChange={(e) =>
          setNickname(e.target.value)
        }
      />

      <button
        className="mt-4 w-full rounded bg-blue-600 p-2 text-white"
        onClick={submitRanking}
      >
        등록
      </button>
    </div>
  </div>
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

{stageClear && (
  <div
    className="
      absolute inset-0
      flex items-center justify-center
      bg-black/60
      z-10
    "
  >
    <div className="text-center space-y-6">
      <h1 className="text-5xl font-bold text-green-400">
        {stageMessage}
      </h1>

      <button
        onClick={() => {
          setStageClear(false);
          gameRef.current?.nextStage();
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
        ▶ {t("nextStage")}
      </button>
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