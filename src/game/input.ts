import type {

  GameState,

  Item,

} from "./types";



import {

  BELT_Y,

  BELT_HEIGHT,

  MAX_STACK,

} from "./constants";



import {

  mergeItems,

  tryReveal,

  getGroupItems,

  clearGroup,

} from "./item";



import {

  removeFromWarehouse,

  addToBelt,

} from "./warehouse";



import {

  isDropZoneHit,

  checkDrop,

  canReplaceZone,

  startReplaceZone,

} from "./dropzone";



import {

  addScore,

  getAccuracy,

  getTotalPlayTime,

} from "./game";



import { playCorrectSound, playWrongSound } from "../sound";



export type InputContext = {

  canvas: HTMLCanvasElement;



  state: GameState;



  width: number;

  height: number;



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



  onPauseChange: (

    paused: boolean

  ) => void;



  onGameOver: (

    result: any

  ) => void;

};



function getMouse(

  ctx: InputContext,

  e: PointerEvent

) {

  const rect =

    ctx.canvas.getBoundingClientRect();



  return {

    x:

      (e.clientX -

        rect.left) *

      (ctx.width /

        rect.width),



    y:

      (e.clientY -

        rect.top) *

      (ctx.height /

        rect.height),

  };

}



export function installInput(

  context: InputContext

) {

  const {

    canvas,

    state,

  } = context;



  const isHudHit = (
    mx: number,
    my: number
  ) => {
    return (
      (
        mx >= context.pauseButton.x &&
        mx <= context.pauseButton.x + context.pauseButton.w &&
        my >= context.pauseButton.y &&
        my <= context.pauseButton.y + context.pauseButton.h
      ) ||
      (
        mx >= context.timeArea.x &&
        mx <= context.timeArea.x + context.timeArea.w &&
        my >= context.timeArea.y &&
        my <= context.timeArea.y + context.timeArea.h
      )
    );
  };



  const onPointerDown = (

    e: PointerEvent

  ) => {

    e.preventDefault();



    if (state.paused) {

      return;

    }



    const {

      x: mx,

      y: my,

    } = getMouse(

      context,

      e

    );



    state.mouseX = mx;

    state.mouseY = my;



    /* HUD 영역은 아이템 드래그 대상으로 취급하지 않는다. */
    if (isHudHit(mx, my)) {
      return;
    }



    /*
     * RT 교체
     *
     * 아이템 번호가 있는 일반 RT 영역을 클릭했을 때
     * 교체 조건을 만족하면 해당 RT를 교체 상태로 전환한다.
     *
     * RT 클릭은 드래그가 아니므로 pointer capture를 잡기 전에
     * 처리하고 바로 return 한다.
     */
for (const zone of state.dropZones) {
  if (zone.itemNo < 0) {
    continue;
  }

  /*
   * render.ts의 changeRT 버튼 영역
   *
   * x: zone.x + 5 ~ zone.x + zone.w - 5
   * y: zone.y + 72 ~ zone.y + 96
   */
  const buttonX =
    zone.x + 5;

  const buttonY =
    zone.y + 72;

  const buttonW =
    zone.w - 10;

  const buttonH =
    24;

  if (
    mx >= buttonX &&
    mx <= buttonX + buttonW &&
    my >= buttonY &&
    my <= buttonY + buttonH
  ) {
    if (canReplaceZone(zone)) {
      startReplaceZone(
        zone,
        context.height
      );
    }

    return;
  }
}



    canvas.setPointerCapture(

      e.pointerId

    );



    /*

     * 창고 아이템 우선

     */

    for (

      let i =

        state.stackedItems.length - 1;

      i >= 0;

      i--

    ) {

      const item =

        state.stackedItems[i];



      if (

        mx >= item.x &&

        mx <=

          item.x + item.size &&

        my >= item.y &&

        my <=

          item.y + item.size

      ) {

        /* 창고 아이템도 클릭하면 번호를 공개한다. */
        tryReveal(item);

        startDrag(

          context,

          item,

          state.stackedItems,

          mx,

          my

        );



        return;

      }

    }



    /*

     * 벨트 아이템

     */

    for (

      let i =

        state.items.length - 1;

      i >= 0;

      i--

    ) {

      const item =

        state.items[i];



      if (

        mx >= item.x &&

        mx <=

          item.x + item.size &&

        my >= item.y &&

        my <=

          item.y + item.size

      ) {

        const picked =

          item.group

            ? item.group.leader

            : item;



        /* 첫 클릭에서 ??를 실제 번호로 공개한다. */
        tryReveal(picked);

        startDrag(

          context,

          picked,

          state.items,

          mx,

          my

        );



        return;

      }

    }

  };



  const onPointerMove = (

    e: PointerEvent

  ) => {

    e.preventDefault();



    const {

      x: mx,

      y: my,

    } = getMouse(

      context,

      e

    );



    state.mouseX = mx;

    state.mouseY = my;



    if (

      state.paused ||

      !state.draggingItem

    ) {

      return;

    }



    const item =

      state.draggingItem;



    const oldX = item.x;

    const oldY = item.y;



    item.x =

      mx - state.dragOffsetX;



    item.y =

      my - state.dragOffsetY;



    const dx =

      item.x - oldX;



    const dy =

      item.y - oldY;



    if (item.group) {

      for (

        const groupItem

          of item.group.items

      ) {

        if (

          groupItem === item

        ) {

          continue;

        }



        groupItem.x += dx;

        groupItem.y += dy;

      }

    }

  };



  const onPointerUp = (

    e: PointerEvent

  ) => {

    if (

      !state.draggingItem

    ) {

      return;

    }



    finishDrag(

      context,

      e

    );



    if (

      canvas.hasPointerCapture(

        e.pointerId

      )

    ) {

      canvas.releasePointerCapture(

        e.pointerId

      );

    }

  };



  canvas.addEventListener(

    "pointerdown",

    onPointerDown

  );



  canvas.addEventListener(

    "pointermove",

    onPointerMove

  );



  canvas.addEventListener(

    "pointerup",

    onPointerUp

  );



  canvas.addEventListener(

    "pointercancel",

    onPointerUp

  );



  return () => {

    canvas.removeEventListener(

      "pointerdown",

      onPointerDown

    );



    canvas.removeEventListener(

      "pointermove",

      onPointerMove

    );



    canvas.removeEventListener(

      "pointerup",

      onPointerUp

    );



    canvas.removeEventListener(

      "pointercancel",

      onPointerUp

    );

  };

}



function startDrag(

  context: InputContext,

  item: Item,

  source: Item[],

  mx: number,

  my: number

) {

  const {

    state,

  } = context;



  state.draggingItem =

    item;



  state.draggingSource =

    source;



  state.originalX =

    item.x;



  state.originalY =

    item.y;



  state.dragOffsetX =

    mx - item.x;



  state.dragOffsetY =

    my - item.y;

}



function finishDrag(

  context: InputContext,

  e: PointerEvent

) {

  const {

    canvas,

    state,

    width,

    height,

    beltEndX,

  } = context;



  const draggingItem =

    state.draggingItem;



  if (!draggingItem) {

    return;

  }



  /*

   * 다른 아이템과 합치기

   */

  for (

    const target of [

      ...state.items,

      ...state.stackedItems,

    ]

  ) {

    if (

      target === draggingItem

    ) {

      continue;

    }



    const overlap =

      draggingItem.x <

        target.x +

          target.size &&

      draggingItem.x +

        draggingItem.size >

        target.x &&

      draggingItem.y <

        target.y +

          target.size &&

      draggingItem.y +

        draggingItem.size >

        target.y;



    if (

      overlap &&

      draggingItem.revealed &&

      target.revealed &&

      draggingItem.itemNo ===

        target.itemNo &&

      draggingItem.broken ===

        target.broken

    ) {

      if (

        mergeItems(

          draggingItem,

          target

        )

      ) {

        /*

         * 창고에서 그룹을 만든 경우

         */

        if (

          state.draggingSource ===

            state.stackedItems &&

          draggingItem.group

        ) {

          for (

            const groupItem

              of draggingItem.group

                .items

          ) {

            if (

              groupItem ===

              draggingItem.group

                .leader

            ) {

              continue;

            }



            const index =

              state.stackedItems.indexOf(

                groupItem

              );



            if (index >= 0) {

              state.stackedItems.splice(

                index,

                1

              );

            }

          }



          context.onPauseChange(

            state.paused

          );

        }



        state.draggingItem =

          null;



        state.draggingSource =

          null;



        return;

      }

    }

  }



  const centerX =

    draggingItem.x +

    draggingItem.size / 2;



  const centerY =

    draggingItem.y +

    draggingItem.size / 2;



  let dropped = false;



  /*

   * 드롭존

   */

  for (

    const zone of state.dropZones

  ) {

    if (

      !isDropZoneHit(

        draggingItem,

        zone

      )

    ) {

      continue;

    }



    const result =

      checkDrop(

        draggingItem,

        zone

      );



    if (result === null) {

      continue;

    }



    if (

      zone.count >=

      zone.capacity

    ) {

      break;

    }



    const groupCount =

      draggingItem.group

        ? draggingItem.group

            .items.length

        : 1;



    zone.count += groupCount;



    if (result) {

      playCorrectSound();



      zone.success++;



      state.dropSuccess++;



      addScore(

        state,

        5

      );

    } else {

      playWrongSound();



      zone.fail++;



      state.dropFail++;



      addScore(

        state,

        -5

      );

    }



    const total =

      zone.success +

      zone.fail;



    const accuracy =

      total > 0

        ? zone.success /

          total *

          100

        : 100;



    if (

      zone.count >= 10 &&

      accuracy < 50

    ) {

      state.finished =

        true;



      state.paused =

        true;



      context.onGameOver({

        score: state.score,



        stage:

          state.currentStage +

          1,



        accuracy:

          Number(

            getAccuracy(state)

          ),



        playTime:

          getTotalPlayTime(state),

      });



      state.draggingItem =

        null;



      state.draggingSource =

        null;



      return;

    }



    const itemsToRemove =

      getGroupItems(

        draggingItem

      );



    for (

      const item of itemsToRemove

    ) {

      const index =

        state.draggingSource?.indexOf(

          item

        ) ?? -1;



      if (index >= 0) {

        state.draggingSource!.splice(

          index,

          1

        );

      }

    }



    clearGroup(

      draggingItem

    );



    dropped = true;



    if (

      state.draggingSource ===

      state.stackedItems

    ) {

      // restack handled below

    }



    break;

  }



  /*

   * 창고 → 벨트

   */

  if (

    !dropped &&

    state.draggingSource ===

      state.stackedItems &&

    centerX >= 0 &&

    centerX <= beltEndX &&

    centerY >= BELT_Y &&

    centerY <=

      BELT_Y + BELT_HEIGHT

  ) {

    const index =

      state.stackedItems.indexOf(

        draggingItem

      );



    if (index >= 0) {

      state.stackedItems.splice(

        index,

        1

      );

    }



    addToBelt(

      state,

      draggingItem,

      centerX

    );



    dropped = true;

  }



  /*

   * 실패 → 원래 위치

   */

  if (!dropped) {

    draggingItem.x =

      state.originalX;



    draggingItem.y =

      state.originalY;

  }



  /*

   * 창고 재배치

   */

  if (

    state.draggingSource ===

    state.stackedItems

  ) {

    const warehouseX =

      width -

      180 -

      20;



    for (

      let i = 0;

      i < state.stackedItems.length;

      i++

    ) {

      const col =

        Math.floor(i / 8);



      const row =

        i % 8;



      state.stackedItems[i].x =

        warehouseX +

        col * 40;



      state.stackedItems[i].y =

        350 -

        row * 40;

    }

  }



  state.draggingItem =

    null;



  state.draggingSource =

    null;

}