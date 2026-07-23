// @ts-nocheck

import { beep, playCorrectSound, playWrongSound } from "./sound";

export function initGame(
  canvas: HTMLCanvasElement,
  onGameOver: (result) => void,
  onGameClear: (result) => void,
  onStageClear: (message: string) => void,
  onPauseChange: (paused: boolean) => void,
  t: (key: string) => string
){
 const ctx = canvas.getContext("2d")!;
  if (!ctx) return () => {};

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const spawnTimers: ReturnType<typeof setTimeout>[] = [];

  const WAREHOUSE_W = 180;
  const WAREHOUSE_H = 310;
  const WAREHOUSE_MARGIN = 20;

  const DROP_ZONE_START_X = 250;
  const DROP_ZONE_END_MARGIN = 40;

  const WAREHOUSE_X = WIDTH - WAREHOUSE_W - WAREHOUSE_MARGIN;  

  const BELT_END_X = WAREHOUSE_X - 20;
  const WAIT_LINE_X = WAREHOUSE_X;

  const BELT_Y = 130;
  const BELT_HEIGHT = 100;

  const PLAY_WIDTH =
  BELT_END_X - DROP_ZONE_START_X - DROP_ZONE_END_MARGIN;

  const NO_SPAWN_RATE = 0.2;
  const MULTI_SPAWN_RATE = 0.1;

  const items: Item[] = [];
  const stackedItems: Item[] = [];

  const dropZones: DropZone[] = [];

const ITEM_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#ffe66d",
  "#95e1d3",
  "#a29bfe"
];


const BLOCKED_X = 20;
const ITEM_FONT=  "bold 18px Arial";
const ITEM_TEXT_ALIGN = "center";


const MAX_STACK = 30;

const RT_CAPACITY = 20;
const RT_CHANGE_THRESHOLD = Math.round(RT_CAPACITY * 0.9);
const STACK_COLS = 4;
const STACK_ROWS = Math.ceil(MAX_STACK / STACK_COLS);
const STACK_SPACING = 40;

  const MAX_GROUP_SIZE = 3;
  const STAGES = [
  {
    time: 120,
    itemCount: 4,
    beltSpeed: 1,
    brokenChance: 0.1,
    spawnMinDelay: 700,
    spawnRandomDelay: 1500,
    itemHide: 0.1,
    miss: 0.03,
    clearText: "stage_clear_1"
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
    clearText: "stage_clear_2"
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
    clearText: "stage_clear_3"
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
    clearText: "stage_clear_4"
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
    clearText: "stage_clear_5"
  }
];

  let currentStage = 0;
  let finished = false;


  // 벨트 속도 (모든 아이템 동일)
  let BELT_SPEED = STAGES[currentStage].beltSpeed;

  let BROKEN_CHANCE = STAGES[currentStage].brokenChance;

    // 아이템 번호 안 보일 확률
  let ITEM_NUMBER_HIDE = STAGES[currentStage].itemHide;

  let SPAWN_MIN_DELAY = STAGES[currentStage].spawnMinDelay;
  let SPAWN_RANDOM_DELAY = STAGES[currentStage].spawnRandomDelay;

  let stageStart = Date.now();
  let remainTime = STAGES[currentStage].time;
  let lastTick = Date.now();

  let itemSize = 50;

  let animationId = 0;
  let paused = false;
  let beltOffset = 0;
  let spawnTimer: ReturnType<typeof setTimeout> | null = null;

  let dropSuccess = 0;
  let dropFail = 0;

  let score = 0;
  let scoreBounce = 0;
  let scoreEffectX = 260;

type ScoreEffect = {
  text: string;
  x: number;
  y: number;
  life: number;
};

const scoreEffects: ScoreEffect[] = [];

  let mouseX = -1;
  let mouseY = -1;

let pauseButton = {
  x: 0,
  y: 28,
  w: 36,
  h: 36,
}

let timeArea = {
  x: 20,
  y: 28,
  w: 0,
  h: 36,
};

type ItemGroup = {
  items: Item[];
  leader: Item;
};

type Item = {
  x: number;
  y: number;
  size: number;

  color: string;
  itemNo: number;

  revealed: boolean;
  revealAttempts: number;
  broken: boolean;

  miss: boolean;
  group?: ItemGroup;
};

type DropZone = {
  itemNo: number;
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

let ITEM_NUMBERS: string[] = [];


function getMissItemNumber() {

  const otherStages: string[] = [];

  for (let stage = 0; stage < STAGES.length; stage++) {

    // 현재 스테이지 제외
    if (stage === currentStage) {
      continue;
    }

    const count = STAGES[stage].itemCount;

    for (let i = 0; i < count; i++) {
      otherStages.push(
        `${stage + 1}${String(i + 1).padStart(2, "0")}`
      );
    }
  }

  return otherStages[
    Math.floor(Math.random() * otherStages.length)
  ];
}


function updateItemNumbers() {
  const count = STAGES[currentStage].itemCount;

  ITEM_NUMBERS = Array.from(
    { length: count },
    (_, i) => `${currentStage + 1}${String(i + 1).padStart(2, "0")}`
  );
}



// 아이템 생성
function spawnItem() {

  let itemNo =
    ITEM_NUMBERS[
      Math.floor(Math.random() * ITEM_NUMBERS.length)
    ];

  let miss = false;


  if (Math.random() < STAGES[currentStage].miss) {

    const wrongNumbers =
      Array.from(
        { length: STAGES.length },
        (_, stageIndex) =>
          Array.from(
            { length: STAGES[stageIndex].itemCount },
            (_, i) =>
              `${stageIndex + 1}${String(i + 1).padStart(2, "0")}`
          )
      )
      .flat()
      .filter(no => !ITEM_NUMBERS.includes(no));


    if (wrongNumbers.length > 0) {

      itemNo =
        wrongNumbers[
          Math.floor(
            Math.random() * wrongNumbers.length
          )
        ];

      miss = true;
    }
  }


  items.push({
    x: -30,
    y: 150,
    size: itemSize,

    color:
      ITEM_COLORS[
        Math.floor(Math.random() * ITEM_COLORS.length)
      ],

    itemNo,

    revealed:
      Math.random() > ITEM_NUMBER_HIDE,

    revealAttempts: 0,

    broken:
      Math.random() < STAGES[currentStage].miss,

    miss
  });
}

function getGroupSize(item: Item) {
  return item.group
    ? item.group.items.length
    : 1;
}

function normalizeGroup(group: ItemGroup) {
  const baseY = group.leader.y;

  for (let i = 0; i < group.items.length; i++) {
    const item = group.items[i];

    item.y = baseY;
    item.x = group.leader.x - i * 6;
  }
}

function mergeItems(a: Item, b: Item) {

  const sizeA = getGroupSize(a);
  const sizeB = getGroupSize(b);

  if (
    sizeA + sizeB > MAX_GROUP_SIZE
  ) {
    return false;
  }

  // 둘 다 단독

  if (!a.group && !b.group) {

    const group: ItemGroup = {
      items: [a, b],
      leader: b
    };

    a.group = group;
    b.group = group;

    normalizeGroup(group);

    return true;
  }

if (a.group && !b.group) {
  a.group.items.push(b);
  b.group = a.group;

  normalizeGroup(a.group);

  return true;
}

if (!a.group && b.group) {
  b.group.items.push(a);
  a.group = b.group;

  normalizeGroup(b.group);

  return true;
}

if (
  a.group &&
  b.group &&
  a.group !== b.group
) {
  for (const item of b.group.items) {
    item.group = a.group;
    a.group.items.push(item);
  }

  normalizeGroup(a.group);

  return true;
}

  return false;
}

const TOP_COUNT =
    Math.ceil(ITEM_NUMBERS.length / 2);

function updateDropZones() {
  dropZones.length = 0;

const TOP_COUNT = Math.ceil(ITEM_NUMBERS.length / 2);

const zoneWidth = 70;

// 오른쪽 여백
const brokenZoneWidth = 100;
const wrongZoneWidth = 100;

const rightPadding =
  brokenZoneWidth +
  wrongZoneWidth +
  40;

// 드롭존 사이 간격
const gap = 30;

// 전체 드롭존 묶음 너비
const totalWidth =
  TOP_COUNT * zoneWidth +
  (TOP_COUNT - 1) * gap;

// 전체 묶음의 시작점
const startX =
  BELT_END_X -
  rightPadding -
  totalWidth;

ITEM_NUMBERS.forEach((itemNo, i) => {
  const zoneX =
    startX +
    (i % TOP_COUNT) * (zoneWidth + gap);

  const zoneY =
    i < TOP_COUNT ? 20 : 280;

  dropZones.push({
    itemNo,
    name: String(itemNo),

    x: zoneX,
    y: zoneY,

    w: zoneWidth,
    h: 50,

    count: 0,
    capacity: RT_CAPACITY,
    success: 0,
    fail: 0,

    replacing: false,
    targetX: zoneX,
    targetY: zoneY,
    originalY: zoneY,    
  });
});



dropZones.push({
  itemNo: -1,
  name: t("broken"),

  x: BELT_END_X - brokenZoneWidth,
  y: 320,

  w: brokenZoneWidth,
  h: 40,

  count: 0,
  capacity: RT_CAPACITY,
  success: 0,
  fail: 0,
});

dropZones.push({
  itemNo: -2,
  name: t("miss"),

  x:
    BELT_END_X -wrongZoneWidth, 

  y: 50,

  w: brokenZoneWidth,
  h: 50,

  count: 0,
  capacity: RT_CAPACITY,
  success: 0,
  fail: 0,

  replacing: false,
  targetX: BELT_END_X - brokenZoneWidth,
  targetY: 380,
  originalY: 380
});

}


let draggingItem: Item | null = null;
let draggingSource: Item[] | null = null;

let dragOffsetX = 0;
let dragOffsetY = 0;

let originalX = 0;
let originalY = 0;



changeStage(0);
updateItemNumbers();





function getZoneAccuracy(zone: DropZone) {

  const total =
    zone.success + zone.fail;

  if (total === 0) {
    return "0";
  }

  return (
    zone.success / total * 100
  ).toFixed(0);
}




function drawDropZones() {

  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";



  for (const zone of dropZones) {

    ctx.fillStyle = "#1b1616";

    ctx.fillRect(
      zone.x,
      zone.y,
      zone.w,
      zone.h
    );

    ctx.strokeStyle = "#999";
    ctx.strokeRect(
      zone.x,
      zone.y,
      zone.w,
      zone.h
    );

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";

ctx.font = "bold 16px Arial";

ctx.fillText(
  zone.name,
  zone.x + zone.w / 2,
  zone.y + 20
);

ctx.font = "12px Arial";

ctx.fillText(
  `${zone.count}/${zone.capacity}`,
  zone.x + zone.w / 2,
  zone.y - 5
);

ctx.fillText(
  `${getZoneAccuracy(zone)}%`,
  zone.x + zone.w / 2,
  zone.y + 65
);


if (zone.replacing) {
  ctx.fillStyle = "#888";
  ctx.font = "bold 12px Arial";

  ctx.fillText(
    t("changingRt"),
    zone.x + zone.w / 2,
    zone.y + 85
  );
} else if (zone.count >= RT_CHANGE_THRESHOLD) {
  ctx.fillStyle = "#facc15";

  ctx.fillRect(
    zone.x + 5,
    zone.y + 72,
    zone.w - 10,
    24
  );

  ctx.fillStyle = "#000";
  ctx.font = "bold 12px Arial";

  ctx.fillText(
    t("changeRt"),
    zone.x + zone.w / 2,
    zone.y + 88
  );
}

  }
}

function getAccuracy() {

  const total = dropSuccess + dropFail;

  if (total === 0) {
    return 100;
  }

  return (
    dropSuccess / total * 100
  ).toFixed(1);

}

function startSpawner() {
    if (paused) {
    spawnTimer = setTimeout(startSpawner, 100);
    return;
  }
  
const r = Math.random();

let count;

if (r < NO_SPAWN_RATE) {
  count = 0;
} else if (r < NO_SPAWN_RATE + MULTI_SPAWN_RATE) {
  count = Math.floor(Math.random() * 4) + 2;
} else {
  count = 1;
}

    for (let i = 0; i < count; i++) {

        spawnTimers.push(
            setTimeout(spawnItem, i * 80)
        );

    }

const nextSpawn =
    SPAWN_MIN_DELAY +
    Math.random() * SPAWN_RANDOM_DELAY;

    spawnTimer = setTimeout(
        startSpawner,
        nextSpawn
    );
}

startSpawner();


function restackWarehouse() {



  for (let i = 0; i < stackedItems.length; i++) {

    const col = Math.floor(i / STACK_ROWS);
    const row = i % STACK_ROWS;

    stackedItems[i].x =
      WAREHOUSE_X + col * STACK_SPACING;

    stackedItems[i].y =
      350 - row * STACK_SPACING;
  }
}

function drawStackedItems() {

  for (const item of stackedItems) {

    if (
      item.group &&
      item.group.leader !== item
    ) {
      continue;
    }

    drawItem(item);
  }
}

function drawWarehouse() {
const WAREHOUSE_W = 180;
const WAREHOUSE_H = 310;
const WAREHOUSE_MARGIN = 20;

const WAREHOUSE_X = WIDTH - WAREHOUSE_W - WAREHOUSE_MARGIN;

const WAREHOUSE_Y = 60;

  ctx.fillStyle = "#888";
  ctx.fillRect(
    WAREHOUSE_X,
    WAREHOUSE_Y,
    WAREHOUSE_W,
    WAREHOUSE_H
  );

  // 제목
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  
ctx.fillText(
  `${t("floor")} (${stackedItems.length}/${MAX_STACK})`,
  WAREHOUSE_X + WAREHOUSE_W / 2,
  WAREHOUSE_Y - 10
);
}

// 컨베이어 벨트 그리기
function drawConveyor() {
  const beltY = BELT_Y;
  const beltHeight = BELT_HEIGHT;

  // 벨트 본체
  ctx.fillStyle = "#555";
  ctx.fillRect(0, beltY, BELT_END_X, beltHeight);

  // 벨트 영역만 그리도록 제한
  ctx.save();

  ctx.beginPath();
  ctx.rect(
    0,
    beltY,
    BELT_END_X,
    beltHeight
  );
  ctx.clip();

  const offset = beltOffset;

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 2;

  for (let x = -40; x < BELT_END_X + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + offset, beltY);
    ctx.lineTo(
      x + 20 + offset,
      beltY + beltHeight
    );
    ctx.stroke();
  }

  ctx.restore();
}

// 아이템 이동
function updateItems() {
  const WAIT_LINE_X = BELT_END_X - 36;
  const ITEM_GAP = 35;
  

  let blockedAtEntrance = false;


const movingItems = items.filter(
  item =>
    item !== draggingItem &&
    !draggingItem?.group?.items.includes(item)
);


  // 앞 아이템부터 처리
  movingItems.sort((a, b) => b.x - a.x);

for (let i = 0; i < movingItems.length; i++) {
    const item = movingItems[i];

    // 창고에 공간이 있으면 적재
    if (
      item.x >= WAIT_LINE_X &&
      stackedItems.length < MAX_STACK
    ) {
      const stackIndex = stackedItems.length;


  if (item === draggingItem) {
    continue;
  }




const col = Math.floor(stackIndex / STACK_ROWS);
const row = stackIndex % STACK_ROWS;

const itemsToStore = item.group
  ? item.group.items
  : [item];

for (const groupItem of itemsToStore) {

  const stackIndex = stackedItems.length;

  const col = Math.floor(
    stackIndex / STACK_ROWS
  );

  const row =
    stackIndex % STACK_ROWS;

  stackedItems.push({
    color: groupItem.color,
    size: groupItem.size,
    itemNo: groupItem.itemNo,
    revealed:
      Math.random() >
      ITEM_NUMBER_HIDE,

    revealAttempts: 0,

    broken: groupItem.broken,

    group: undefined,

    x:
      WAREHOUSE_X +
      col * STACK_SPACING,

    y:
      350 -
      row * STACK_SPACING
  });
}

for (const groupItem of itemsToStore) {
  groupItem.group = undefined;
}

score = Math.max(0, score - 1);

restackWarehouse();

for (const removeItem of itemsToStore) {
  const idx = items.indexOf(removeItem);

  if (idx >= 0) {
    items.splice(idx, 1);
  }
}

scoreEffects.push({
  text: "-1",
  x: scoreEffectX,
  y: 30,
  life: 30,
});

const itemsToRemove = item.group
  ? item.group.items
  : [item];

for (const removeItem of itemsToRemove) {

  const idx =
    items.indexOf(removeItem);

  if (idx >= 0) {
    items.splice(idx, 1);
  }
}
      continue;
    }

    let targetX;

    if (i === 0) {
      targetX = WAIT_LINE_X;
    } else {
      targetX = movingItems[i - 1].x - ITEM_GAP;
    }

    const oldX = item.x;
    const nextX = item.x + BELT_SPEED;

    if (nextX < targetX) {
      item.x = nextX;
    } else {
      item.x = targetX;
    }

    // =========================
    // 마지막 아이템이 막혀있는지 확인
    // =========================
    if (
      stackedItems.length >= MAX_STACK &&
      i === movingItems.length - 1
    ) {
      if (item.x === oldX) {
        blockedAtEntrance = true;
      }
    }
  }

  // =========================
  // GAME OVER
  // =========================
if (
  stackedItems.length >= MAX_STACK &&
  blockedAtEntrance
) {
  if (finished) return;

  finished = true;

  paused = true;

const totalPlayTime =
  STAGES
    .slice(0, currentStage + 1)
    .reduce(
      (sum, stage) => sum + stage.time,
      0
    ) - remainTime;

onGameOver({
  score,
  stage: currentStage + 1,
  accuracy: Number(getAccuracy()),
  playTime: totalPlayTime,
});

return;
}
}

function drawItem(item: Item) {

  const groupSize =
    item.group?.items.length ?? 1;

  // 뒤에 있는 박스부터 그림
  for (let i = groupSize - 1; i >= 0; i--) {

    const x = item.x - i * 6;
    const y = item.y - i * 6;

    ctx.fillStyle = item.color;

    ctx.fillRect(
      x,
      y,
      item.size,
      item.size
    );

    ctx.strokeStyle = "#000";

    ctx.strokeRect(
      x,
      y,
      item.size,
      item.size
    );
  }

  // 맨 위 박스에 번호 표시
  ctx.fillStyle = "#000";
  ctx.font = ITEM_FONT;
  ctx.textAlign = ITEM_TEXT_ALIGN;

  ctx.fillText(
    item.revealed
      ? item.itemNo
      : "???",
    item.x + item.size / 2,
    item.y + 25
  );

  if (item.broken) {
    drawBrokenMark(item);
  }

// 몇 개 묶음인지 표시
if (groupSize > 1) {

  ctx.save();

  const cx = item.x + item.size / 2;
  const cy = item.y + item.size + 12;

  // 노란 원
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fill();

  // 검은 테두리
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 숫자
  ctx.fillStyle = "#000";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    String(groupSize),
    cx,
    cy
  );

  ctx.restore();
}
}


// 아이템 그리기
function drawItems() {

  for (const item of items) {

    if (
      item.group &&
      item.group.leader !== item
    ) {
      continue;
    }

    drawItem(item);
  }
}

function drawBrokenMark(item: Item) {
  if (!item.broken) return;

  ctx.save();

  const x = item.x;
  const y = item.y;
  const s = item.size;

  // ==========================
  // 빨간 X
  // ==========================
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = "#ff2020";
  ctx.lineWidth = 4;

  const pad = 7;

  ctx.beginPath();
  ctx.moveTo(x + pad, y + pad);
  ctx.lineTo(x + s - pad, y + s - pad);

  ctx.moveTo(x + s - pad, y + pad);
  ctx.lineTo(x + pad, y + s - pad);

  ctx.stroke();

  ctx.restore();
}

function tryReveal(item) {

  if (item.revealed) return false;

  item.revealAttempts++;

  let chance = 0;

  if (item.revealAttempts === 1) {
    chance = 0.25;
  } else if (item.revealAttempts === 2) {
    chance = 0.5;
  } else {
    chance = 1;
  }

  if (Math.random() < chance) {
    item.revealed = true;
  }

  return true;
}

const onClick = (e: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();

  const scaleX = WIDTH / rect.width;
  const scaleY = HEIGHT / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;


const clickedPause =
  (mx >= pauseButton.x &&
    mx <= pauseButton.x + pauseButton.w &&
    my >= pauseButton.y &&
    my <= pauseButton.y + pauseButton.h) ||
  (mx >= timeArea.x &&
    mx <= timeArea.x + timeArea.w &&
    my >= timeArea.y &&
    my <= timeArea.y + timeArea.h);

if (clickedPause) {
  paused = true;
  onPauseChange(true);

  return;
}

for (const zone of dropZones) {
  if (
    zone.count >= RT_CHANGE_THRESHOLD &&
    !zone.replacing &&
    mx >= zone.x &&
    mx <= zone.x + zone.w &&
    my >= zone.y &&
    my <= zone.y + 96
  ) {
    zone.replacing = true;

    zone.targetY =
      zone.y < HEIGHT / 2
        ? -100
        : HEIGHT + 100;

    return;
  }
}


  if (paused) return;

for (const item of items) {

  if (
    mx >= item.x &&
    mx <= item.x + item.size &&
    my >= item.y &&
    my <= item.y + item.size
  ) {
    tryReveal(item);
    return;
  }
}

for (const item of stackedItems) {

  if (
    mx >= item.x &&
    mx <= item.x + item.size &&
    my >= item.y &&
    my <= item.y + item.size
  ) {
    tryReveal(item);
    return;
  }
}
};
canvas.addEventListener("pointerdown", onClick);

const onPointerDown = (e: PointerEvent) => {
e.preventDefault();
if (paused) return;

canvas.setPointerCapture(e.pointerId);
const rect = canvas.getBoundingClientRect();

const mx = (e.clientX - rect.left) * (WIDTH  / rect.width);
const my = (e.clientY - rect.top) * (HEIGHT / rect.height);

// 창고 아이템 우선 선택
for (let i = stackedItems.length - 1; i >= 0; i--) {


const item = stackedItems[i];

if (
  mx >= item.x &&
  mx <= item.x + item.size &&
  my >= item.y &&
  my <= item.y + item.size
) {

  draggingItem = item;
  draggingSource = stackedItems;

  originalX = item.x;
  originalY = item.y;

  dragOffsetX = mx - item.x;
  dragOffsetY = my - item.y;

  return;

}

}

// 벨트 아이템 선택
for (let i = items.length - 1; i >= 0; i--) {


const item = items[i];

if (
  mx >= item.x &&
  mx <= item.x + item.size &&
  my >= item.y &&
  my <= item.y + item.size
) {

  draggingItem = item.group
  ? item.group.leader
  : item;
  draggingSource = items;

const picked = item.group
  ? item.group.leader
  : item;

draggingItem = picked;

originalX = picked.x;
originalY = picked.y;

dragOffsetX = mx - picked.x;
dragOffsetY = my - picked.y;

  return;
}


}
};

canvas.addEventListener("pointerdown", onPointerDown);

const onPointerMove = (e: PointerEvent) => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  const scaleX = WIDTH / rect.width;
  const scaleY = HEIGHT / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  mouseX = mx;
  mouseY = my;

  if (paused) return;
  if (!draggingItem) return;

const oldX = draggingItem.x;
const oldY = draggingItem.y;

draggingItem.x = mx - dragOffsetX;
draggingItem.y = my - dragOffsetY;

const dx =
  draggingItem.x - oldX;

const dy =
  draggingItem.y - oldY;

if (draggingItem.group) {

  for (const item of draggingItem.group.items) {

    if (item === draggingItem) {
      continue;
    }

    item.x += dx;
    item.y += dy;
  }
}
};


canvas.addEventListener("pointermove", onPointerMove);

const onPointerUp = (e: PointerEvent) => {
 if (paused) return;
 
  if (!draggingItem) return;


for (const target of [...items, ...stackedItems]) {

  if (target === draggingItem) {
    continue;
  }

  const overlap =
    draggingItem.x < target.x + target.size &&
    draggingItem.x + draggingItem.size > target.x &&
    draggingItem.y < target.y + target.size &&
    draggingItem.y + draggingItem.size > target.y;

if (
  overlap &&
  draggingItem.revealed &&
  target.revealed &&
  draggingItem.itemNo === target.itemNo &&
  draggingItem.broken === target.broken
) {

if (
  mergeItems(
    draggingItem,
    target
  )
) {

  // 창고에서 그룹 생성 시
  if (
    draggingSource === stackedItems &&
    draggingItem.group
  ) {

    for (const groupItem of draggingItem.group.items) {

      if (groupItem === draggingItem.group.leader) {
        continue;
      }

      const idx =
        stackedItems.indexOf(groupItem);

      if (idx >= 0) {
        stackedItems.splice(idx, 1);
      }
    }

    restackWarehouse();
  }

  draggingItem = null;
  draggingSource = null;

  return;
}
  }
}


  const centerX =
    draggingItem.x + draggingItem.size / 2;

  const centerY =
    draggingItem.y + draggingItem.size / 2;

  let dropped = false;

  

  // ======================
  // 드롭존 검사
  // ======================
  for (const zone of dropZones) {

if (
  draggingItem.x < zone.x + zone.w &&
  draggingItem.x + draggingItem.size > zone.x &&
  draggingItem.y < zone.y + zone.h &&
  draggingItem.y + draggingItem.size > zone.y
) {

  // 파손품은 파손 존(-1)에만 드롭 가능
if (
  draggingItem.broken &&
  zone.itemNo !== -1
) {
  continue;
}

// 정상품은 파손 존에 드롭 불가
if (
  !draggingItem.broken &&
  zone.itemNo === -1
) {
  continue;
}

if (zone.count >= zone.capacity) {
  break;
}

zone.count += draggingItem.group
  ? draggingItem.group.items.length
  : 1;

let success = false;

// 파손 존
if (zone.itemNo === -1) {

  success =
    draggingItem.broken;

}

// miss 존
else if (zone.itemNo === -2) {

  success =
    draggingItem.miss;

}

// 일반 번호 존
else {

  success =
    !draggingItem.broken &&
    !draggingItem.miss &&
    draggingItem.itemNo === zone.itemNo;

}

if (success) {
    playCorrectSound();
    zone.success++;
    dropSuccess++;

    score += 5;

scoreBounce = 8;

scoreEffects.push({
  text: "+5",
  x: scoreEffectX,
  y: 30,
  life: 40,
});
} else {
    playWrongSound();
    zone.fail++;
    dropFail++;

    score = Math.max(0, score - 5);

    scoreBounce = 8;

scoreEffects.push({
  text: "-5",
  x: scoreEffectX,
  y: 30,
  life: 40,
});
}

const total = zone.success + zone.fail;
const accuracy =
  total > 0
    ? (zone.success / total) * 100
    : 100;

if (
  zone.count >= 10 &&
  accuracy < 50
) {
  finished = true;
  paused = true;

  const totalPlayTime =
    STAGES
      .slice(0, currentStage + 1)
      .reduce(
        (sum, stage) => sum + stage.time,
        0
      ) - remainTime;

  onGameOver({
    score,
    stage: currentStage + 1,
    accuracy: Number(getAccuracy()),
    playTime: totalPlayTime,
  });

  return;
}

const itemsToRemove = draggingItem.group
  ? draggingItem.group.items
  : [draggingItem];

for (const item of itemsToRemove) {

  const idx =
    draggingSource.indexOf(item);

  if (idx >= 0) {
    draggingSource.splice(idx, 1);
  }
}

if (draggingItem.group) {
  for (const item of draggingItem.group.items) {
    item.group = undefined;
  }
}

if (draggingSource === stackedItems) {
  restackWarehouse();
}

dropped = true;
break;
    }
  }

  // ======================
  // 창고 → 벨트
  // ======================
if (
  !dropped &&
  draggingSource === stackedItems &&
  centerX >= 0 &&
  centerX <= BELT_END_X &&
  centerY >= BELT_Y &&
  centerY <= BELT_Y + BELT_HEIGHT
) {

    const idx =
      stackedItems.indexOf(draggingItem);

    if (idx >= 0) {
      stackedItems.splice(idx, 1);
      restackWarehouse();
    }

    draggingItem.x =
      centerX - draggingItem.size / 2;

    draggingItem.y = 150;

const newX =
  centerX - draggingItem.size / 2;

// 기존 위치에서 제거
const oldIndex =
  items.indexOf(draggingItem);

if (oldIndex >= 0) {
  items.splice(oldIndex, 1);
}

// 사용자가 놓은 위치 기준으로 정렬
items.push(draggingItem);

items.sort((a, b) => {

  if (a === draggingItem) {
    return newX - b.x;
  }

  if (b === draggingItem) {
    return a.x - newX;
  }

  return a.x - b.x;
});

    dropped = true;
  }

  // ======================
  // 실패 시 원위치
  // ======================
  if (!dropped) {

    draggingItem.x = originalX;
    draggingItem.y = originalY;
  }

draggingItem = null;
draggingSource = null;

canvas.releasePointerCapture(e.pointerId);
};


canvas.addEventListener("pointerup", onPointerUp);


canvas.addEventListener("pointercancel", onPointerUp);


function drawPausedButton(
  pauseHovered: boolean
) {


ctx.save();

ctx.textAlign = "center";
ctx.textBaseline = "middle";

ctx.fillStyle = pauseHovered
  ? "#fde047"
  : "#ffffff";

const barWidth = 6;
const barHeight = 22;
const gap = 6;

const centerX = pauseButton.x + pauseButton.w / 2;
const centerY = pauseButton.y + pauseButton.h / 2;

ctx.fillRect(
  centerX - gap / 2 - barWidth,
  centerY - barHeight / 2,
  barWidth,
  barHeight
);

ctx.fillRect(
  centerX + gap / 2,
  centerY - barHeight / 2,
  barWidth,
  barHeight
);

ctx.restore();

ctx.textAlign = "left";
}

function loop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
ctx.fillStyle = "white";
ctx.font = "24px Arial";
ctx.textAlign = "left";

if (!paused) {
  const now = Date.now();

  if (now - lastTick >= 1000) {
    remainTime--;
    lastTick += 1000;
  }
}

ctx.fillStyle = "white";
ctx.font = "24px Arial";

const prefix =
  `${t("line")} ${currentStage + 1} / ${t("performance")}: `;

ctx.textAlign = "left";

ctx.fillText(prefix, 20, 30);

const prefixWidth =
  ctx.measureText(prefix).width;

const scale =
  1 + scoreBounce * 0.03;

ctx.save();

ctx.translate(
  20 + prefixWidth,
  30
);

ctx.scale(scale, scale);

ctx.font = "bold 26px Arial";

ctx.fillStyle = "#facc15";

ctx.fillText(
  String(score),
  0,
  0
);

ctx.restore();

scoreBounce *= 0.85;

if (scoreBounce < 0.1) {
  scoreBounce = 0;
}

remainTime = Math.max(0, remainTime);
const minutes = Math.floor(remainTime / 60);
const seconds = remainTime % 60;

const prefixText = `${t("untilLeaving")}`;
const secondsText =
  minutes + ":" + String(seconds).padStart(2, "0");

const timePrefixWidth =
  ctx.measureText(prefixText).width;

const timeWidth =
  timePrefixWidth +
  ctx.measureText(secondsText).width;


timeArea.w = timeWidth;

const pauseHovered =
  (mouseX >= timeArea.x &&
    mouseX <= timeArea.x + timeArea.w &&
    mouseY >= timeArea.y &&
    mouseY <= timeArea.y + timeArea.h) ||
  (mouseX >= pauseButton.x &&
    mouseX <= pauseButton.x + pauseButton.w &&
    mouseY >= pauseButton.y &&
    mouseY <= pauseButton.y + pauseButton.h);

let timeColor = "#00ff00";

if (remainTime > 120) {
  timeColor = "#ff0000";
} else if (remainTime > 90) {
  timeColor = "#ffff00";
} else if (remainTime > 60) {
  timeColor = "#ffffff";
} else if (remainTime > 30) {
  timeColor = "#66ccff";
}

// 앞부분은 항상 흰색
ctx.fillStyle = "#ffffff";
ctx.fillText(prefixText, 20, 60);

// 초 부분만 색 변경
ctx.fillStyle = timeColor;
ctx.fillText(
  secondsText,
  20 + timePrefixWidth + 5,
  60
);

pauseButton.x = 20 + timeWidth + 20;
pauseButton.y = 34;

drawPausedButton(pauseHovered);
  drawConveyor();
  drawWarehouse();

  if (!paused) {
     beltOffset = (beltOffset + BELT_SPEED * 2) % 40;
    updateItems();
  }

  drawItems();
  drawStackedItems();
  drawDropZones();

  for (let i = scoreEffects.length - 1; i >= 0; i--) {
  const effect = scoreEffects[i];

  ctx.save();

  ctx.globalAlpha =
    effect.life / 40;

  ctx.font =
    "bold 20px Arial";

  ctx.fillStyle =
    effect.text.startsWith("+")
      ? "#4ade80"
      : "#ef4444";

  ctx.textAlign = "left";

  ctx.fillText(
    effect.text,
    effect.x,
    effect.y
  );

  ctx.restore();

  effect.y -= 1.5;
  effect.life--;

  if (effect.life <= 0) {
    scoreEffects.splice(i, 1);
  }
}

const scoreWidth =
  ctx.measureText(String(score)).width;

scoreEffectX =
  20 + prefixWidth + scoreWidth + 10;


  animationId = requestAnimationFrame(loop);

if (remainTime <= 0) {

  if (finished) {
    return;
  }

  if (currentStage + 1 < STAGES.length) {
    paused = true;

    onStageClear(
      t(STAGES[currentStage].clearText)
    );
  } else {
    finished = true;

    paused = true;

const totalPlayTime =
  STAGES
    .slice(0, currentStage + 1)
    .reduce(
      (sum, stage) => sum + stage.time,
      0
    ) - remainTime;    

  onGameClear({
    score,
    stage: currentStage + 1,
    accuracy: Number(getAccuracy()),
    playTime: totalPlayTime,
  });
  }
}

  canvas.style.cursor = pauseHovered 
  ? "pointer"
  : "default";


  for (const zone of dropZones) {
  if (!zone.replacing) {
    continue;
  }

  zone.y += (zone.targetY - zone.y) * 0.1;

if (Math.abs(zone.targetY - zone.y) < 2) {
  if (
    zone.targetY < 0 ||
    zone.targetY > HEIGHT
  ) {
    zone.count = 0;
    zone.success = 0;
    zone.fail = 0;

    // RT 교체 보상
    score += 30;

    scoreBounce = 12;

scoreEffects.push({
  text: "+30",
  x: scoreEffectX,
  y: 30,
  life: 50,
});

    // 반대편에서 다시 등장
zone.y =
  zone.originalY < HEIGHT / 2
    ? -100
    : HEIGHT + 100;

    zone.targetY = zone.originalY;

  } else {
    zone.replacing = false;
    zone.y = zone.originalY;
  }
}
}
}

loop();

function changeStage(stage: number) {
  finished = false;
  currentStage = stage;

  remainTime = STAGES[stage].time;
  lastTick = Date.now();

  // 이전 스테이지 벨트 아이템 제거
  items.length = 0;

  // (선택) 드래그 중인 아이템도 취소
  draggingItem = null;
  draggingSource = null;

  updateItemNumbers();
  updateDropZones();

  stackedItems.length = 0;
  restackWarehouse();

  BELT_SPEED = STAGES[stage].beltSpeed;
  BROKEN_CHANCE = STAGES[stage].brokenChance;
  ITEM_NUMBER_HIDE = STAGES[stage].itemHide;
  SPAWN_MIN_DELAY = STAGES[stage].spawnMinDelay;
  SPAWN_RANDOM_DELAY = STAGES[stage].spawnRandomDelay;

  stageStart = Date.now();


}


return {
pause() {
  paused = true;

  onPauseChange(true);
},

resume() {
  paused = false;
  lastTick = Date.now();

  onPauseChange(false);
},

  nextStage() {
    paused = false;
    changeStage(currentStage + 1);
  },

  destroy() {
    cancelAnimationFrame(animationId);

    if (spawnTimer) {
      clearTimeout(spawnTimer);
    }

    spawnTimers.forEach(clearTimeout);

canvas.removeEventListener("pointerdown", onClick);

canvas.removeEventListener("pointerdown", onPointerDown);
canvas.removeEventListener("pointermove", onPointerMove);
canvas.removeEventListener("pointerup", onPointerUp);
canvas.removeEventListener("pointercancel", onPointerUp);
  }
};
}