// @ts-nocheck

export function initGame(canvas: HTMLCanvasElement) {
 const ctx = canvas.getContext("2d")!;
  if (!ctx) return () => {};

  let animationId = 0;
  let spawnTimer: ReturnType<typeof setTimeout> | null = null;
  const spawnTimers: ReturnType<typeof setTimeout>[] = [];

type Item = {
  x: number;
  y: number;
  size: number;
  color: string;
  itemNo: number;
  revealed: boolean;
  revealAttempts: number;
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
};

const items: Item[] = [];
const stackedItems: Item[] = [];
const dropZones: DropZone[] = [];

// 벨트 속도 (모든 아이템 동일)
const BELT_SPEED = 1;

const ITEM_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#ffe66d",
  "#95e1d3",
  "#a29bfe"
];

const ITEM_NUMBERS = [
  101,
  102,
  103,
  104,
  105,
  106,
  107,
  108,
  109,
  110,
  111,
  112
];
const BLOCKED_X = 20;
const ITEM_FONT=  "bold 18px Arial";
const ITEM_TEXT_ALIGN = "center";

const STACK_COLS = 3;
const STACK_ROWS = 10;
const STACK_SPACING = 40;
const MAX_STACK = STACK_COLS * STACK_ROWS;

let gameOver = false;

// 아이템 생성
function spawnItem() {
items.push({
  x: -30,
  y: 188,
  size: 36,

  color: ITEM_COLORS[
    Math.floor(Math.random() * ITEM_COLORS.length)
  ],

  itemNo: ITEM_NUMBERS[
    Math.floor(Math.random() * ITEM_NUMBERS.length)
  ],

  revealed: Math.random() < 0.5, // 절반은 처음부터 공개
  revealAttempts: 0
});
}

const DROP_ZONE_CAPACITY = 50;

const TOP_COUNT =
  Math.ceil(ITEM_NUMBERS.length / 2);

ITEM_NUMBERS.forEach((itemNo, i) => {

dropZones.push({
  itemNo,
  name: String(itemNo),

  x: 250 + (i % TOP_COUNT) * 80,

  y: i < TOP_COUNT
    ? 20
    : 320,

  w: 70,
  h: 50,

  count: 0,
  capacity: 30,

  success: 0,
  fail: 0
});

});

let draggingItem: Item | null = null;
let draggingSource: Item[] | null = null;

let dragOffsetX = 0;
let dragOffsetY = 0;

let originalX = 0;
let originalY = 0;



let dropSuccess = 0;
let dropFail = 0;


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

    ctx.fillStyle = "#444";

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

    if (gameOver) return;

    const count =
        Math.random() < 0.25
            ? Math.floor(Math.random() * 4) + 2
            : 1;

    for (let i = 0; i < count; i++) {

        spawnTimers.push(
            setTimeout(spawnItem, i * 80)
        );

    }

    const nextSpawn =
        300 + Math.random() * 2000;

    spawnTimer = setTimeout(
        startSpawner,
        nextSpawn
    );
}

startSpawner();


function drawGameOver() {

  if (!gameOver) return;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    canvas.height / 2
  );
}

function restackWarehouse() {

  const WAREHOUSE_X = 840;

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
  }
}

function drawWarehouse() {
  const WAREHOUSE_X = 840;
  const WAREHOUSE_Y = 60;
  const WAREHOUSE_W = 180;
  const WAREHOUSE_H = 310;

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
    `바닥 (${stackedItems.length}/${MAX_STACK})`,
    WAREHOUSE_X + WAREHOUSE_W / 2,
    WAREHOUSE_Y - 15
  );
}

// 컨베이어 벨트 그리기
function drawConveyor() {
  const beltY = 180;
  const beltHeight = 100;
  const BELT_END_X = 820;

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

  const offset = (Date.now() / 20) % 40;

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
  const WAIT_LINE_X = 840;
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


const WAREHOUSE_X = 840;
const WAREHOUSE_W = 180;

const col = Math.floor(stackIndex / STACK_ROWS);
const row = stackIndex % STACK_ROWS;

stackedItems.push({
  color: item.color,
  size: item.size,
  itemNo: item.itemNo,
  revealed: Math.random() < 0.5,
  revealAttempts: 0,

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
    !gameOver &&
    stackedItems.length >= MAX_STACK &&
    blockedAtEntrance
  ) {
    gameOver = true;
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
  item.y + item.size / 2+10
)
  }
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

const onClick = (e: MouseEvent) => {

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

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

canvas.addEventListener(
    "click",
    onClick
);

const onMouseDown = (e: MouseEvent) => {

const rect = canvas.getBoundingClientRect();

const mx = e.clientX - rect.left;
const my = e.clientY - rect.top;

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

canvas.addEventListener(
    "mousedown",
    onMouseDown
);



const onMouseMove = (e: MouseEvent) => {

if (!draggingItem) return;

const rect = canvas.getBoundingClientRect();

const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const mx = (e.clientX - rect.left) * scaleX;
const my = (e.clientY - rect.top) * scaleY;

draggingItem.x = mx - dragOffsetX;
draggingItem.y = my - dragOffsetY;
};

canvas.addEventListener(
    "mousemove",
    onMouseMove
);


const onMouseUp = () => {

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

if (zone.count >= zone.capacity) {
  break;
}

zone.count++;

if (draggingItem.itemNo === zone.itemNo) {

  zone.success++;
  dropSuccess++;

} else {

  zone.fail++;
  dropFail++;

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
    centerX <= 820 &&
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
};

canvas.addEventListener(
    "mouseup",
    onMouseUp
);

function loop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawConveyor();
  drawWarehouse();

  if (!gameOver) {
    updateItems();
  }

  drawItems();
  drawStackedItems();
  drawDropZones();
  drawGameOver();

  animationId = requestAnimationFrame(loop);
}

loop();

return () => {

    cancelAnimationFrame(
        animationId
    );

    if (spawnTimer) {

        clearTimeout(
            spawnTimer
        );

    }

    spawnTimers.forEach(
        clearTimeout
    );

    canvas.removeEventListener(
        "click",
        onClick
    );

    canvas.removeEventListener(
        "mousedown",
        onMouseDown
    );

    canvas.removeEventListener(
        "mousemove",
        onMouseMove
    );

    canvas.removeEventListener(
        "mouseup",
        onMouseUp
    );

};
}