import type {
  GameState,
  Item,
} from "./types";

import {
  MAX_STACK,
  STACK_ROWS,
  STACK_SPACING,
  WAREHOUSE_W,
  WAREHOUSE_MARGIN,
} from "./constants";

export function getWarehouseX(
  canvasWidth: number
) {
  return (
    canvasWidth -
    WAREHOUSE_W -
    WAREHOUSE_MARGIN
  );
}

export function restackWarehouse(
  state: GameState,
  canvasWidth: number
) {
  const warehouseX =
    getWarehouseX(canvasWidth);

  for (
    let i = 0;
    i < state.stackedItems.length;
    i++
  ) {
    const col =
      Math.floor(i / STACK_ROWS);

    const row =
      i % STACK_ROWS;

    state.stackedItems[i].x =
      warehouseX +
      col * STACK_SPACING;

    state.stackedItems[i].y =
      350 -
      row * STACK_SPACING;
  }
}

export function storeItem(
  state: GameState,
  item: Item,
  canvasWidth: number
) {
  const warehouseX =
    getWarehouseX(canvasWidth);

  const itemsToStore =
    item.group
      ? [...item.group.items]
      : [item];

  for (const groupItem of itemsToStore) {
    if (
      state.stackedItems.length >=
      MAX_STACK
    ) {
      break;
    }

    const stackIndex =
      state.stackedItems.length;

    const col =
      Math.floor(
        stackIndex / STACK_ROWS
      );

    const row =
      stackIndex % STACK_ROWS;

    state.stackedItems.push({
      color: groupItem.color,
      size: groupItem.size,
      itemNo: groupItem.itemNo,

      revealed:
        groupItem.revealed,

      revealAttempts: 0,

      broken: groupItem.broken,
      miss: groupItem.miss,

      group: undefined,

      x:
        warehouseX +
        col * STACK_SPACING,

      y:
        350 -
        row * STACK_SPACING,
    });

    groupItem.group = undefined;
  }

  for (const groupItem of itemsToStore) {
    const index =
      state.items.indexOf(groupItem);

    if (index >= 0) {
      state.items.splice(index, 1);
    }
  }

  restackWarehouse(
    state,
    canvasWidth
  );
}

export function removeFromWarehouse(
  state: GameState,
  item: Item,
  canvasWidth: number
) {
  const index =
    state.stackedItems.indexOf(item);

  if (index >= 0) {
    state.stackedItems.splice(
      index,
      1
    );
  }

  restackWarehouse(
    state,
    canvasWidth
  );
}

export function addToBelt(
  state: GameState,
  item: Item,
  x: number
) {
  item.x =
    x - item.size / 2;

  item.y = 150;

  const oldIndex =
    state.items.indexOf(item);

  if (oldIndex >= 0) {
    state.items.splice(
      oldIndex,
      1
    );
  }

  state.items.push(item);

  state.items.sort(
    (a, b) => a.x - b.x
  );
}