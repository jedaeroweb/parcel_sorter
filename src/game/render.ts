import type {
  GameState,
  Item,
  DropZone,
} from "./types";

import {
  BELT_Y,
  BELT_HEIGHT,
  ITEM_FONT,
  ITEM_TEXT_ALIGN,
  MAX_STACK,
  WAREHOUSE_H,
  WAREHOUSE_MARGIN,
  WAREHOUSE_W,
  RT_CHANGE_THRESHOLD,
} from "./constants";

import {
  getWarehouseX,
} from "./warehouse";

import {
  getZoneAccuracy,
} from "./dropzone";

export type RenderContext = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState;

  beltEndX: number;

  pauseButton: {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  timeArea: {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  t: (key: string) => string;
};

export function drawConveyor(
  rc: RenderContext
) {
  const {
    ctx,
    state,
    beltEndX,
  } = rc;

  ctx.fillStyle = "#555";

  ctx.fillRect(
    0,
    BELT_Y,
    beltEndX,
    BELT_HEIGHT
  );

  ctx.save();

  ctx.beginPath();

  ctx.rect(
    0,
    BELT_Y,
    beltEndX,
    BELT_HEIGHT
  );

  ctx.clip();

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 2;

  for (
    let x = -40;
    x < beltEndX + 40;
    x += 40
  ) {
    ctx.beginPath();

    ctx.moveTo(
      x + state.beltOffset,
      BELT_Y
    );

    ctx.lineTo(
      x +
        20 +
        state.beltOffset,
      BELT_Y + BELT_HEIGHT
    );

    ctx.stroke();
  }

  ctx.restore();
}

export function drawWarehouse(
  rc: RenderContext
) {
  const {
    ctx,
    canvas,
    state,
    t,
  } = rc;

  const warehouseX =
    getWarehouseX(canvas.width);

  const warehouseY = 60;

  ctx.fillStyle = "#888";

  ctx.fillRect(
    warehouseX,
    warehouseY,
    WAREHOUSE_W,
    WAREHOUSE_H
  );

  ctx.fillStyle = "#fff";

  ctx.font =
    "bold 18px Arial";

  ctx.textAlign = "center";

  ctx.fillText(
    `${t("floor")} (${state.stackedItems.length}/${MAX_STACK})`,
    warehouseX +
      WAREHOUSE_W / 2,
    warehouseY - 10
  );
}

export function drawBrokenMark(
  ctx: CanvasRenderingContext2D,
  item: Item
) {
  if (!item.broken) {
    return;
  }

  ctx.save();

  const x = item.x;
  const y = item.y;
  const s = item.size;

  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = "#ff2020";
  ctx.lineWidth = 4;

  const pad = 7;

  ctx.beginPath();

  ctx.moveTo(
    x + pad,
    y + pad
  );

  ctx.lineTo(
    x + s - pad,
    y + s - pad
  );

  ctx.moveTo(
    x + s - pad,
    y + pad
  );

  ctx.lineTo(
    x + pad,
    y + s - pad
  );

  ctx.stroke();

  ctx.restore();
}

export function drawItem(
  ctx: CanvasRenderingContext2D,
  item: Item
) {
  const groupSize =
    item.group?.items.length ?? 1;

  for (
    let i = groupSize - 1;
    i >= 0;
    i--
  ) {
    const x =
      item.x - i * 6;

    const y =
      item.y - i * 6;

    ctx.fillStyle =
      item.color;

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

  ctx.fillStyle = "#000";

  ctx.font = ITEM_FONT;

  ctx.textAlign =
    ITEM_TEXT_ALIGN;

  ctx.fillText(
    item.revealed
      ? item.itemNo
      : "???",

    item.x +
      item.size / 2,

    item.y + 25
  );

  drawBrokenMark(
    ctx,
    item
  );

  if (groupSize > 1) {
    ctx.save();

    const cx =
      item.x +
      item.size / 2;

    const cy =
      item.y +
      item.size +
      12;

    ctx.fillStyle =
      "#facc15";

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      13,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
      "#222";

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.fillStyle = "#000";

    ctx.font =
      "bold 16px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      String(groupSize),
      cx,
      cy
    );

    ctx.restore();
  }
}

export function drawItems(
  rc: RenderContext
) {
  const {
    ctx,
    state,
  } = rc;

  for (const item of state.items) {
    if (
      item.group &&
      item.group.leader !== item
    ) {
      continue;
    }

    drawItem(
      ctx,
      item
    );
  }
}

export function drawStackedItems(
  rc: RenderContext
) {
  const {
    ctx,
    state,
  } = rc;

  for (
    const item of state.stackedItems
  ) {
    if (
      item.group &&
      item.group.leader !== item
    ) {
      continue;
    }

    drawItem(
      ctx,
      item
    );
  }
}

export function drawDropZones(
  rc: RenderContext
) {
  const {
    ctx,
    state,
    t,
  } = rc;

  ctx.fillStyle = "#fff";
  ctx.font =
    "bold 18px Arial";

  ctx.textAlign =
    "center";

  for (
    const zone of state.dropZones
  ) {
    ctx.fillStyle =
      "#1b1616";

    ctx.fillRect(
      zone.x,
      zone.y,
      zone.w,
      zone.h
    );

    ctx.strokeStyle =
      "#999";

    ctx.strokeRect(
      zone.x,
      zone.y,
      zone.w,
      zone.h
    );

    ctx.fillStyle =
      "#fff";

    ctx.font =
      "bold 16px Arial";

    ctx.textAlign =
      "center";

    ctx.fillText(
      zone.name,
      zone.x +
        zone.w / 2,
      zone.y + 20
    );

    ctx.font =
      "12px Arial";

    ctx.fillText(
      `${zone.count}/${zone.capacity}`,
      zone.x +
        zone.w / 2,
      zone.y - 5
    );

    ctx.fillText(
      `${getZoneAccuracy(zone)}%`,
      zone.x +
        zone.w / 2,
      zone.y + 65
    );

    if (zone.replacing) {
      ctx.fillStyle =
        "#888";

      ctx.font =
        "bold 12px Arial";

      ctx.fillText(
        t("changingRt"),
        zone.x +
          zone.w / 2,
        zone.y + 85
      );
    } else if (
      zone.count >=
      RT_CHANGE_THRESHOLD
    ) {
      ctx.fillStyle =
        "#facc15";

      ctx.fillRect(
        zone.x + 5,
        zone.y + 72,
        zone.w - 10,
        24
      );

      ctx.fillStyle =
        "#000";

      ctx.font =
        "bold 12px Arial";

      ctx.fillText(
        t("changeRt"),
        zone.x +
          zone.w / 2,
        zone.y + 88
      );
    }
  }
}

export function drawPausedButton(
  rc: RenderContext,
  hovered: boolean
) {
  const {
    ctx,
    pauseButton,
  } = rc;

  ctx.save();

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    hovered
      ? "#fde047"
      : "#ffffff";

  const barWidth = 6;
  const barHeight = 22;
  const gap = 6;

  const centerX =
    pauseButton.x +
    pauseButton.w / 2;

  const centerY =
    pauseButton.y +
    pauseButton.h / 2;

  ctx.fillRect(
    centerX -
      gap / 2 -
      barWidth,
    centerY -
      barHeight / 2,
    barWidth,
    barHeight
  );

  ctx.fillRect(
    centerX +
      gap / 2,
    centerY -
      barHeight / 2,
    barWidth,
    barHeight
  );

  ctx.restore();

  ctx.textAlign =
    "left";
}

export function drawScoreEffects(
  rc: RenderContext
) {
  const {
    ctx,
    state,
  } = rc;

  for (
    let i =
      state.scoreEffects.length - 1;
    i >= 0;
    i--
  ) {
    const effect =
      state.scoreEffects[i];

    ctx.save();

    ctx.globalAlpha =
      effect.life / 40;

    ctx.font =
      "bold 20px Arial";

    ctx.fillStyle =
      effect.text.startsWith("+")
        ? "#4ade80"
        : "#ef4444";

    ctx.textAlign =
      "left";

    ctx.fillText(
      effect.text,
      effect.x,
      effect.y
    );

    ctx.restore();

    effect.y -= 1.5;
    effect.life--;

    if (effect.life <= 0) {
      state.scoreEffects.splice(
        i,
        1
      );
    }
  }
}