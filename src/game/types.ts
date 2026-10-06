export type ItemGroup = {
  items: Item[];
  leader: Item;
};

export type Item = {
  x: number;
  y: number;
  size: number;

  color: string;
  itemNo: string;

  revealed: boolean;
  revealAttempts: number;

  broken: boolean;
  miss: boolean;

  group?: ItemGroup;
};

export type DropZone = {
  itemNo: string | number;
  name: string;

  x: number;
  y: number;
  w: number;
  h: number;

  count: number;
  capacity: number;

  success: number;
  fail: number;

  replacing: boolean;
  targetX: number;
  targetY: number;
  originalY: number;
};

export type Stage = {
  time: number;
  itemCount: number;
  beltSpeed: number;
  brokenChance: number;

  spawnMinDelay: number;
  spawnRandomDelay: number;

  itemHide: number;
  miss: number;

  clearText: string;
};

export type ScoreEffect = {
  text: string;
  x: number;
  y: number;
  life: number;
};

export type GameState = {
  items: Item[];
  stackedItems: Item[];
  dropZones: DropZone[];

  scoreEffects: ScoreEffect[];

  currentStage: number;
  finished: boolean;
  paused: boolean;

  remainTime: number;
  lastTick: number;

  beltOffset: number;

  score: number;
  scoreBounce: number;
  scoreEffectX: number;

  draggingItem: Item | null;
  draggingSource: Item[] | null;

  dragOffsetX: number;
  dragOffsetY: number;

  originalX: number;
  originalY: number;

  mouseX: number;
  mouseY: number;

  itemNumbers: string[];

  dropSuccess: number;
  dropFail: number;
};