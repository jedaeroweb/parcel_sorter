// @ts-nocheck

import { beep, playCorrectSound, playWrongSound } from "./sound";

export function initGame(
  canvas: HTMLCanvasElement,
  onGameOver: (
    result: {
      score: number;
      stage: number;
      accuracy: number;
      playTime: number;
    }
  ) => void,
  onStageClear: (message: string) => void,
  onPauseChange: (paused: boolean) => void,
  t: (key: string) => string
) {
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

const RT_CAPACITY = 30;
const RT_CHANGE_THRESHOLD = Math.round(RT_CAPACITY * 0.9);
const STACK_COLS = 4;
const STACK_ROWS = Math.ceil(MAX_STACK / STACK_COLS);
const STACK_SPACING = 40;

  
  const STAGES = [
  {
    time: 120,
    itemCount: 4,
    beltSpeed: 1,
    brokenChance: 0.1,
    spawnMinDelay: 700,
    spawnRandomDelay: 1500,
    itemHide: 0.1,
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
    clearText: "stage_clear_5"
  }
];

  let currentStage = 0;

  // 벨트 속도 (모든 아이템 동일)
  let BELT_SPEED = STAGES[0].beltSpeed;

  let BROKEN_CHANCE = STAGES[0].brokenChance;

    // 아이템 번호 안 보일 확률
  let ITEM_NUMBER_HIDE = STAGES[0].itemHide;

  let SPAWN_MIN_DELAY = STAGES[0].spawnMinDelay;
  let SPAWN_RANDOM_DELAY = STAGES[0].spawnRandomDelay;

  let stageStart = Date.now();
  let remainTime = STAGES[0].time;
  let lastTick = Date.now();

  let itemSize = 36;

  let animationId = 0;
  let paused = false;
  let beltOffset = 0;
  let spawnTimer: ReturnType<typeof setTimeout> | null = null;

  let dropSuccess = 0;
  let dropFail = 0;

  let score = 0;

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

type Item = {
  x: number;
  y: number;
  size: number;
  color: string;
  itemNo: number;
  revealed: boolean;
  revealAttempts: number;
   broken: boolean;
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


function updateItemNumbers() {
  const count = STAGES[currentStage].itemCount;

  ITEM_NUMBERS = Array.from(
    { length: count },
    (_, i) => `${currentStage + 1}${String(i + 1).padStart(2, "0")}`
  );
}

// 아이템 생성
function spawnItem() {
items.push({
  x: -30,
  y: 188,
  size: itemSize,

  color: ITEM_COLORS[
    Math.floor(Math.random() * ITEM_COLORS.length)
  ],

  itemNo: ITEM_NUMBERS[
    Math.floor(Math.random() * ITEM_NUMBERS.length)
  ],

  revealed: Math.random() > ITEM_NUMBER_HIDE,
  revealAttempts: 0,
  broken: false
});
}

const TOP_COUNT =
    Math.ceil(ITEM_NUMBERS.length / 2);

function updateDropZones() {
  dropZones.length = 0;

const TOP_COUNT = Math.ceil(ITEM_NUMBERS.length / 2);

const zoneWidth = 70;

// 오른쪽 여백
const brokenZoneWidth = 100;

const rightPadding =
  brokenZoneWidth + 20;

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
  h: 50,

  count: 0,
  capacity: RT_CAPACITY,
  success: 0,
  fail: 0,
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

    ctx.fillStyle = item.color;

    ctx.fillRect(
      item.x,
      item.y,
      item.size,
      item.size
    );

    ctx.strokeStyle = "#000";
    ctx.strokeRect(
      item.x,
      item.y,
      item.size,
      item.size
    );

    ctx.fillStyle = "#000";
    ctx.font = ITEM_FONT;
    ctx.textAlign = ITEM_TEXT_ALIGN;

ctx.fillText(
  item.revealed ? item.itemNo : "???",
  item.x + item.size / 2,
  item.y + 15
);

if (item.broken) {
  ctx.fillStyle = "#ff3333";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";

drawBrokenLabel(item);

  }
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
  WAREHOUSE_Y - 15
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
  const ITEM_GAP = 28;

  let blockedAtEntrance = false;


  const movingItems =
  items.filter(
    item => item !== draggingItem
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

stackedItems.push({
  color: item.color,
  size: item.size,
  itemNo: item.itemNo,
  revealed: Math.random() > ITEM_NUMBER_HIDE,
  revealAttempts: 0,
  broken: Math.random() < BROKEN_CHANCE,

  x: WAREHOUSE_X + col * STACK_SPACING,
  y: 350 - row * STACK_SPACING
});

restackWarehouse();

const realIndex =
  items.indexOf(item);

if (realIndex >= 0) {
  items.splice(realIndex, 1);
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


// 아이템 그리기
function drawItems() {
  for (const item of items) {

    ctx.fillStyle = item.color;

    ctx.fillRect(
      item.x,
      item.y,
      item.size,
      item.size
    );

    ctx.strokeStyle = "#000";
    ctx.strokeRect(
      item.x,
      item.y,
      item.size,
      item.size
    );

    // 번호 표시
    ctx.fillStyle = "#000";
    ctx.font = ITEM_FONT;
    ctx.textAlign = ITEM_TEXT_ALIGN;

ctx.fillText(
  item.revealed ? item.itemNo : "???",
  item.x + item.size / 2,
  item.y + 15
)

if (item.broken) {
  ctx.fillStyle = "#ff3333";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";

drawBrokenLabel(item);
}

  }
}

function drawBrokenLabel(item: Item) {
  if (!item.broken) {
    return;
  }

  ctx.fillStyle = "#ff3333";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    t("broken"),
    item.x + item.size / 2,
    item.y + 30
  );
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

  draggingItem = item;
  draggingSource = items;

  originalX = item.x;
  originalY = item.y;

  dragOffsetX = mx - item.x;
  dragOffsetY = my - item.y;

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

  draggingItem.x = mx - dragOffsetX;
  draggingItem.y = my - dragOffsetY;
};


canvas.addEventListener("pointermove", onPointerMove);

const onPointerUp = (e: PointerEvent) => {
 if (paused) return;
 
  if (!draggingItem) return;

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

zone.count++;

let success = false;

// 파손품 전용 존
if (zone.itemNo === -1) {
    success = draggingItem.broken;
}
// 일반 존
else {
    success =
        !draggingItem.broken &&
        draggingItem.itemNo === zone.itemNo;
}

if (success) {
    playCorrectSound();
    zone.success++;
    dropSuccess++;

    score += 5;
} else {
    playWrongSound();
    zone.fail++;
    dropFail++;

    score -= 5;
}

const idx =
  draggingSource.indexOf(draggingItem);

if (idx >= 0) {
  draggingSource.splice(idx, 1);

  if (draggingSource === stackedItems) {
    restackWarehouse();
  }
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
    centerY >= 180 &&
    centerY <= 280
  ) {

    const idx =
      stackedItems.indexOf(draggingItem);

    if (idx >= 0) {
      stackedItems.splice(idx, 1);
      restackWarehouse();
    }

    draggingItem.x =
      centerX - draggingItem.size / 2;

    draggingItem.y = 188;

    items.push(draggingItem);

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

const headerText =
  `${t("line")} ${currentStage + 1} / ${t("performance")}: ${score}`;


ctx.fillText(headerText, 20, 30);

remainTime = Math.max(0, remainTime);
const minutes = Math.floor(remainTime / 60);
const seconds = remainTime % 60;

const timeText =
  `${t("untilLeaving")} ${minutes}:${String(seconds).padStart(2, "0")}`;

const timeWidth = ctx.measureText(timeText).width;

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

ctx.fillStyle = "#ffffff";

ctx.fillText(timeText, 20, 60);

pauseButton.x = 20 + timeWidth + 15;
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

  animationId = requestAnimationFrame(loop);

if (remainTime <= 0) {
  if (currentStage + 1 < STAGES.length) {
    paused = true;

    onStageClear(
      t(STAGES[currentStage].clearText)
    );
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