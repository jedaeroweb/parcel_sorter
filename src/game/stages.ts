import type { Stage } from "./types";

export const STAGES: Stage[] = [
  {
    time: 120,
    itemCount: 4,
    beltSpeed: 1,
    brokenChance: 0.1,
    spawnMinDelay: 700,
    spawnRandomDelay: 1500,
    itemHide: 0.1,
    miss: 0.03,
    clearText: "stage_clear_1",
  },

  {
    time: 140,
    itemCount: 6,
    beltSpeed: 1.3,
    brokenChance: 0.15,
    spawnMinDelay: 600,
    spawnRandomDelay: 1300,
    itemHide: 0.15,
    miss: 0.04,
    clearText: "stage_clear_2",
  },

  {
    time: 160,
    itemCount: 8,
    beltSpeed: 1.7,
    brokenChance: 0.2,
    spawnMinDelay: 500,
    spawnRandomDelay: 1100,
    itemHide: 0.2,
    miss: 0.05,
    clearText: "stage_clear_3",
  },

  {
    time: 180,
    itemCount: 10,
    beltSpeed: 1.7,
    brokenChance: 0.2,
    spawnMinDelay: 400,
    spawnRandomDelay: 800,
    itemHide: 0.2,
    miss: 0.06,
    clearText: "stage_clear_4",
  },

  {
    time: 200,
    itemCount: 12,
    beltSpeed: 1.7,
    brokenChance: 0.2,
    spawnMinDelay: 350,
    spawnRandomDelay: 600,
    itemHide: 0.2,
    miss: 0.07,
    clearText: "stage_clear_5",
  },
];