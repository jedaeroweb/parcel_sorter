import type { GameState } from "./types";

export function createGameState(): GameState {
  return {
    items: [],
    stackedItems: [],
    dropZones: [],

    scoreEffects: [],

    currentStage: 0,
    finished: false,
    paused: false,

    remainTime: 0,
    lastTick: Date.now(),

    beltOffset: 0,

    score: 0,
    scoreBounce: 0,
    scoreEffectX: 260,

    draggingItem: null,
    draggingSource: null,

    dragOffsetX: 0,
    dragOffsetY: 0,

    originalX: 0,
    originalY: 0,

    mouseX: -1,
    mouseY: -1,

    itemNumbers: [],

    dropSuccess: 0,
    dropFail: 0,
  };
}