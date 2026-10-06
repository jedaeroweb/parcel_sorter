import type {
  GameState,
  Item,
  ItemGroup,
  Stage,
} from "./types";

import {
  ITEM_COLORS,
  MAX_GROUP_SIZE,
} from "./constants";

import { STAGES } from "./stages";

export function updateItemNumbers(
  state: GameState
) {
  const count =
    STAGES[state.currentStage].itemCount;

  state.itemNumbers = Array.from(
    { length: count },
    (_, i) =>
      `${state.currentStage + 1}${String(i + 1).padStart(2, "0")}`
  );
}

export function getMissItemNumber(
  state: GameState
) {
  const otherStages: string[] = [];

  for (
    let stage = 0;
    stage < STAGES.length;
    stage++
  ) {
    if (stage === state.currentStage) {
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
    Math.floor(
      Math.random() * otherStages.length
    )
  ];
}

export function spawnItem(
  state: GameState,
  stage: Stage,
  itemSize: number
) {
  let itemNo =
    state.itemNumbers[
      Math.floor(
        Math.random() *
          state.itemNumbers.length
      )
    ];

  let miss = false;

  if (Math.random() < stage.miss) {
    const wrongNumbers: string[] = [];

    for (
      let stageIndex = 0;
      stageIndex < STAGES.length;
      stageIndex++
    ) {
      for (
        let i = 0;
        i < STAGES[stageIndex].itemCount;
        i++
      ) {
        const no =
          `${stageIndex + 1}${String(i + 1).padStart(2, "0")}`;

        if (!state.itemNumbers.includes(no)) {
          wrongNumbers.push(no);
        }
      }
    }

    if (wrongNumbers.length > 0) {
      itemNo =
        wrongNumbers[
          Math.floor(
            Math.random() *
              wrongNumbers.length
          )
        ];

      miss = true;
    }
  }

  state.items.push({
    x: -30,
    y: 150,
    size: itemSize,

    color:
      ITEM_COLORS[
        Math.floor(
          Math.random() *
            ITEM_COLORS.length
        )
      ],

    itemNo,

    revealed:
      Math.random() > stage.itemHide,

    revealAttempts: 0,

    broken:
      Math.random() < stage.brokenChance,

    miss,
  });
}

export function getGroupSize(item: Item) {
  return item.group
    ? item.group.items.length
    : 1;
}

export function normalizeGroup(
  group: ItemGroup
) {
  const baseY = group.leader.y;

  for (
    let i = 0;
    i < group.items.length;
    i++
  ) {
    const item = group.items[i];

    item.y = baseY;
    item.x =
      group.leader.x - i * 6;
  }
}

export function mergeItems(
  a: Item,
  b: Item
) {
  const sizeA = getGroupSize(a);
  const sizeB = getGroupSize(b);

  if (
    sizeA + sizeB >
    MAX_GROUP_SIZE
  ) {
    return false;
  }

  if (!a.group && !b.group) {
    const group: ItemGroup = {
      items: [a, b],
      leader: b,
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

export function tryReveal(item: Item) {
  if (item.revealed) {
    return false;
  }

  item.revealAttempts++;

  let chance = 0;

  if (item.revealAttempts === 1) {
    chance = 0.25;
  } else if (
    item.revealAttempts === 2
  ) {
    chance = 0.5;
  } else {
    chance = 1;
  }

  if (Math.random() < chance) {
    item.revealed = true;
  }

  return true;
}

export function getGroupItems(item: Item) {
  return item.group
    ? item.group.items
    : [item];
}

export function clearGroup(
  item: Item
) {
  if (!item.group) {
    return;
  }

  for (const groupItem of item.group.items) {
    groupItem.group = undefined;
  }
}