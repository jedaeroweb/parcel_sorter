import type {
  DropZone,
  GameState,
} from "./types";

import {
  RT_CAPACITY,
  RT_CHANGE_THRESHOLD,
} from "./constants";

import { STAGES } from "./stages";

export function getZoneAccuracy(
  zone: DropZone
) {
  const total =
    zone.success + zone.fail;

  if (total === 0) {
    return "0";
  }

  return (
    (zone.success / total) *
    100
  ).toFixed(0);
}

export function updateDropZones(
  state: GameState,
  canvasWidth: number,
  beltEndX: number,
  t: (key: string) => string
) {
  state.dropZones.length = 0;

  const itemNumbers =
    state.itemNumbers;

  const topCount =
    Math.ceil(
      itemNumbers.length / 2
    );

  const zoneWidth = 70;

  const brokenZoneWidth = 100;
  const wrongZoneWidth = 100;

  const rightPadding =
    brokenZoneWidth +
    wrongZoneWidth +
    40;

  const gap = 30;

  const totalWidth =
    topCount * zoneWidth +
    (topCount - 1) * gap;

  const startX =
    beltEndX -
    rightPadding -
    totalWidth;

  itemNumbers.forEach(
    (itemNo, i) => {
      const zoneX =
        startX +
        (i % topCount) *
          (zoneWidth + gap);

      const zoneY =
        i < topCount
          ? 20
          : 280;

      state.dropZones.push({
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
    }
  );

  state.dropZones.push({
    itemNo: -1,
    name: t("broken"),

    x:
      beltEndX -
      brokenZoneWidth,

    y: 320,

    w: brokenZoneWidth,
    h: 40,

    count: 0,
    capacity: RT_CAPACITY,

    success: 0,
    fail: 0,

    replacing: false,

    targetX:
      beltEndX -
      brokenZoneWidth,

    targetY: 320,

    originalY: 320,
  });

  state.dropZones.push({
    itemNo: -2,
    name: t("miss"),

    x:
      beltEndX -
      wrongZoneWidth,

    y: 50,

    w: wrongZoneWidth,
    h: 50,

    count: 0,
    capacity: RT_CAPACITY,

    success: 0,
    fail: 0,

    replacing: false,

    targetX:
      beltEndX -
      wrongZoneWidth,

    targetY: 50,

    originalY: 50,
  });
}

export function isDropZoneHit(
  item: any,
  zone: DropZone
) {
  return (
    item.x <
      zone.x + zone.w &&
    item.x + item.size >
      zone.x &&
    item.y <
      zone.y + zone.h &&
    item.y + item.size >
      zone.y
  );
}

export function checkDrop(
  item: any,
  zone: DropZone
) {
  if (item.broken && zone.itemNo !== -1) {
    return null;
  }

  if (
    !item.broken &&
    zone.itemNo === -1
  ) {
    return null;
  }

  if (
    zone.itemNo === -2
  ) {
    return item.miss;
  }

  if (
    zone.itemNo === -1
  ) {
    return item.broken;
  }

  return (
    !item.broken &&
    !item.miss &&
    item.itemNo === zone.itemNo
  );
}

export function canReplaceZone(
  zone: DropZone
) {
  return (
    zone.count >=
      RT_CHANGE_THRESHOLD &&
    !zone.replacing
  );
}

export function startReplaceZone(
  zone: DropZone,
  height: number
) {
  zone.replacing = true;

  zone.targetY =
    zone.y < height / 2
      ? -100
      : height + 100;
}

export function updateReplacingZones(
  state: GameState,
  width: number,
  height: number
) {
  for (const zone of state.dropZones) {
    if (!zone.replacing) {
      continue;
    }

    zone.y +=
      (zone.targetY - zone.y) *
      0.1;

    if (
      Math.abs(
        zone.targetY - zone.y
      ) < 2
    ) {
      if (
        zone.targetY < 0 ||
        zone.targetY > height
      ) {
        zone.count = 0;
        zone.success = 0;
        zone.fail = 0;

        state.score += 30;
        state.scoreBounce = 12;

        state.scoreEffects.push({
          text: "+30",
          x: state.scoreEffectX,
          y: 30,
          life: 50,
        });

        zone.y =
          zone.originalY <
          height / 2
            ? -100
            : height + 100;

        zone.targetY =
          zone.originalY;
      } else {
        zone.replacing = false;
        zone.y =
          zone.originalY;
      }
    }
  }
}