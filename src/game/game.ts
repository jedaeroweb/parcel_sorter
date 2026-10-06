import type {
  GameState,
  Item,
} from "./types";

import {
  BELT_HEIGHT,
  ITEM_SIZE,
  MAX_STACK,
} from "./constants";

import { STAGES } from "./stages";

import {
  spawnItem,
  updateItemNumbers,
  getGroupItems,
  clearGroup,
} from "./item";

import {
  storeItem,
  restackWarehouse,
} from "./warehouse";

import {
  updateDropZones,
  updateReplacingZones,
} from "./dropzone";

export type GameCallbacks = {
  onGameOver: (result: any) => void;
  onGameClear: (result: any) => void;
  onStageClear: (message: string) => void;
};

export type GameRuntime = {
  state: GameState;

  width: number;
  height: number;

  beltEndX: number;

  itemSize: number;

  callbacks: GameCallbacks;

  t: (key: string) => string;
};

export function getAccuracy(
  state: GameState
) {
  const total =
    state.dropSuccess +
    state.dropFail;

  if (total === 0) {
    return 100;
  }

  return (
    state.dropSuccess /
    total *
    100
  ).toFixed(1);
}

export function getTotalPlayTime(
  state: GameState
) {
  return STAGES
    .slice(
      0,
      state.currentStage + 1
    )
    .reduce(
      (sum, stage) =>
        sum + stage.time,
      0
    ) - state.remainTime;
}

export function changeStage(
  runtime: GameRuntime,
  stageIndex: number
) {
  const {
    state,
    beltEndX,
    width,
    t,
  } = runtime;

  const stage =
    STAGES[stageIndex];

  state.finished = false;

  state.currentStage =
    stageIndex;

  state.remainTime =
    stage.time;

  state.lastTick =
    Date.now();

  state.items.length = 0;

  state.draggingItem = null;
  state.draggingSource = null;

  updateItemNumbers(state);

  updateDropZones(
    state,
    width,
    beltEndX,
    t
  );

  state.stackedItems.length = 0;

  restackWarehouse(
    state,
    width
  );
}

export function updateItems(
  runtime: GameRuntime
) {
  const {
    state,
    beltEndX,
    width,
  } = runtime;

  const beltSpeed =
    STAGES[
      state.currentStage
    ].beltSpeed;

  const waitLineX =
    beltEndX - 36;

  const itemGap = 35;

  let blockedAtEntrance =
    false;

  const movingItems =
    state.items.filter(
      item =>
        item !==
          state.draggingItem &&
        !state.draggingItem
          ?.group?.items
          .includes(item)
    );

  movingItems.sort(
    (a, b) =>
      b.x - a.x
  );

  for (
    let i = 0;
    i < movingItems.length;
    i++
  ) {
    const item =
      movingItems[i];

    if (
      item.x >= waitLineX &&
      state.stackedItems.length <
        MAX_STACK
    ) {
      storeItem(
        state,
        item,
        width
      );

      state.score =
        Math.max(
          0,
          state.score - 1
        );

      state.scoreEffects.push({
        text: "-1",
        x: state.scoreEffectX,
        y: 30,
        life: 30,
      });

      continue;
    }

    let targetX: number;

    if (i === 0) {
      targetX =
        waitLineX;
    } else {
      targetX =
        movingItems[i - 1].x -
        itemGap;
    }

    const oldX =
      item.x;

    const nextX =
      item.x +
      beltSpeed;

    if (nextX < targetX) {
      item.x = nextX;
    } else {
      item.x = targetX;
    }

    if (
      state.stackedItems.length >=
        MAX_STACK &&
      i ===
        movingItems.length - 1
    ) {
      if (
        item.x === oldX
      ) {
        blockedAtEntrance =
          true;
      }
    }
  }

  if (
    state.stackedItems.length >=
      MAX_STACK &&
    blockedAtEntrance
  ) {
    gameOver(runtime);
  }
}

export function updateTime(
  runtime: GameRuntime
) {
  const {
    state,
  } = runtime;

  if (state.paused) {
    return;
  }

  const now =
    Date.now();

  if (
    now - state.lastTick >=
    1000
  ) {
    state.remainTime--;

    state.lastTick += 1000;
  }

  state.remainTime =
    Math.max(
      0,
      state.remainTime
    );
}

export function updateScore(
  state: GameState
) {
  state.scoreBounce *= 0.85;

  if (
    state.scoreBounce < 0.1
  ) {
    state.scoreBounce = 0;
  }
}

export function updateGame(
  runtime: GameRuntime
) {
  const {
    state,
  } = runtime;

  updateTime(runtime);

  if (!state.paused) {
    state.beltOffset =
      (
        state.beltOffset +
        STAGES[
          state.currentStage
        ].beltSpeed *
          2
      ) % 40;

    updateItems(runtime);
  }

  updateScore(state);

  updateReplacingZones(
    state,
    runtime.width,
    runtime.height
  );

  if (
    state.remainTime <= 0
  ) {
    handleTimeOver(runtime);
  }
}

function gameOver(
  runtime: GameRuntime
) {
  const {
    state,
    callbacks,
  } = runtime;

  if (state.finished) {
    return;
  }

  state.finished = true;
  state.paused = true;

  callbacks.onGameOver({
    score: state.score,

    stage:
      state.currentStage + 1,

    accuracy:
      Number(
        getAccuracy(state)
      ),

    playTime:
      getTotalPlayTime(state),
  });
}

function handleTimeOver(
  runtime: GameRuntime
) {
  const {
    state,
    callbacks,
    t,
  } = runtime;

  if (state.finished) {
    return;
  }

  if (
    state.currentStage + 1 <
    STAGES.length
  ) {
    state.paused = true;

    callbacks.onStageClear(
      t(
        STAGES[
          state.currentStage
        ].clearText
      )
    );

    return;
  }

  state.finished = true;
  state.paused = true;

  callbacks.onGameClear({
    score: state.score,

    stage:
      state.currentStage + 1,

    accuracy:
      Number(
        getAccuracy(state)
      ),

    playTime:
      getTotalPlayTime(state),
  });
}

export function addScore(
  state: GameState,
  amount: number
) {
  state.score =
    Math.max(
      0,
      state.score + amount
    );

  state.scoreBounce = 8;

  state.scoreEffects.push({
    text:
      amount >= 0
        ? `+${amount}`
        : String(amount),

    x: state.scoreEffectX,
    y: 30,
    life: 40,
  });
}