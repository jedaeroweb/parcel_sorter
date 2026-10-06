// @ts-nocheck



import {

  ITEM_SIZE,

  WAREHOUSE_W,

  WAREHOUSE_MARGIN,

} from "./game/constants";



import { STAGES } from "./game/stages";



import {

  createGameState,

} from "./game/state";



import {

  changeStage,

  updateGame,

} from "./game/game";



import {

  installInput,

} from "./game/input";



import {

  drawConveyor,

  drawWarehouse,

  drawItems,

  drawStackedItems,

  drawDropZones,

  drawScoreEffects,

  drawPausedButton,

} from "./game/render";



export function initGame(

  canvas: HTMLCanvasElement,



  onGameOver: (

    result

  ) => void,



  onGameClear: (

    result

  ) => void,



  onStageClear: (

    message: string

  ) => void,



  onPauseChange: (

    paused: boolean

  ) => void,



  t: (

    key: string

  ) => string

) {

  const ctx =

    canvas.getContext("2d");



  if (!ctx) {

    return () => {};

  }



  const WIDTH =

    canvas.width;



  const HEIGHT =

    canvas.height;



  const state =

    createGameState();



  const WAREHOUSE_X =

    WIDTH -

    WAREHOUSE_W -

    WAREHOUSE_MARGIN;



  const BELT_END_X =

    WAREHOUSE_X - 20;



  const pauseButton = {

    x: 0,

    y: 28,

    w: 36,

    h: 36,

  };



  const timeArea = {

    x: 20,

    y: 28,

    w: 0,

    h: 36,

  };



  let animationId = 0;



  const runtime = {

    state,



    width: WIDTH,

    height: HEIGHT,



    beltEndX:

      BELT_END_X,



    itemSize:

      ITEM_SIZE,



    callbacks: {

      onGameOver,

      onGameClear,

      onStageClear,

    },



    t,

  };



  /*

   * 최초 스테이지

   */

  changeStage(

    runtime,

    0

  );



  /*

   * Pointer 이벤트

   */

  const removeInput =

    installInput({

      canvas,



      state,



      width: WIDTH,

      height: HEIGHT,



      beltEndX:

        BELT_END_X,



      pauseButton,



      timeArea,



      onPauseChange,



      onGameOver,

    });



  /*

   * Spawn

   */

  let spawnTimer:

    ReturnType<

      typeof setTimeout

    > | null = null;



  const spawnTimers:

    ReturnType<

      typeof setTimeout

    >[] = [];



  function spawnItem() {

    const stage =

      STAGES[

        state.currentStage

      ];



    let count: number;



    const r =

      Math.random();



    if (r < 0.2) {

      count = 0;

    } else if (

      r < 0.3

    ) {

      count =

        Math.floor(

          Math.random() * 4

        ) + 2;

    } else {

      count = 1;

    }



    for (

      let i = 0;

      i < count;

      i++

    ) {

      const timer =

        setTimeout(

          () => {

            if (!state.paused) {

              import("./game/item").then(

                ({

                  spawnItem,

                }) => {

                  spawnItem(

                    state,

                    STAGES[

                      state.currentStage

                    ],

                    ITEM_SIZE

                  );

                }

              );

            }

          },

          i * 80

        );



      spawnTimers.push(

        timer

      );

    }



    const nextSpawn =

      stage.spawnMinDelay +

      Math.random() *

        stage.spawnRandomDelay;



    spawnTimer =

      setTimeout(

        spawnItem,

        nextSpawn

      );

  }



  spawnItem();



  function drawHud() {

    ctx.fillStyle =

      "white";



    ctx.font =

      "24px Arial";



    ctx.textAlign =

      "left";



    const prefix =

      `${t("line")} ${state.currentStage + 1} / ${t("performance")}: `;



    ctx.fillText(

      prefix,

      20,

      30

    );



    const prefixWidth =

      ctx.measureText(

        prefix

      ).width;



    const scale =

      1 +

      state.scoreBounce *

        0.03;



    ctx.save();



    ctx.translate(

      20 + prefixWidth,

      30

    );



    ctx.scale(

      scale,

      scale

    );



    ctx.font =

      "bold 26px Arial";



    ctx.fillStyle =

      "#facc15";



    ctx.fillText(

      String(state.score),

      0,

      0

    );



    ctx.restore();



    const minutes =

      Math.floor(

        state.remainTime /

          60

      );



    const seconds =

      state.remainTime %

      60;



    const prefixText =

      t("untilLeaving");



    const secondsText =

      minutes +

      ":" +

      String(seconds)

        .padStart(2, "0");



    const timePrefixWidth =

      ctx.measureText(

        prefixText

      ).width;



    const timeWidth =

      timePrefixWidth +

      ctx.measureText(

        secondsText

      ).width;



    timeArea.w =

      timeWidth;



    const pauseHovered =

      (

        state.mouseX >=

          timeArea.x &&

        state.mouseX <=

          timeArea.x +

            timeArea.w &&

        state.mouseY >=

          timeArea.y &&

        state.mouseY <=

          timeArea.y +

            timeArea.h

      ) ||

      (

        state.mouseX >=

          pauseButton.x &&

        state.mouseX <=

          pauseButton.x +

            pauseButton.w &&

        state.mouseY >=

          pauseButton.y &&

        state.mouseY <=

          pauseButton.y +

            pauseButton.h

      );



    let timeColor =

      "#00ff00";



    if (

      state.remainTime > 120

    ) {

      timeColor =

        "#ff0000";

    } else if (

      state.remainTime > 90

    ) {

      timeColor =

        "#ffff00";

    } else if (

      state.remainTime > 60

    ) {

      timeColor =

        "#ffffff";

    } else if (

      state.remainTime > 30

    ) {

      timeColor =

        "#66ccff";

    }



    ctx.fillStyle =

      "#ffffff";



    ctx.fillText(

      prefixText,

      20,

      60

    );



    ctx.fillStyle =

      timeColor;



    ctx.fillText(

      secondsText,

      20 +

        timePrefixWidth +

        5,

      60

    );



    pauseButton.x =

      20 +

      timeWidth +

      20;



    pauseButton.y =

      34;



    drawPausedButton(

      {

        canvas,

        ctx,

        state,



        beltEndX:

          BELT_END_X,



        pauseButton,

        timeArea,



        t,

      },

      pauseHovered

    );



    canvas.style.cursor =

      pauseHovered

        ? "pointer"

        : "default";

  }



  /*

   * Pause 클릭

   */

const onHudPointerDown = (e: PointerEvent): boolean => {

  const rect = canvas.getBoundingClientRect();



  const mx =

    (e.clientX - rect.left) *

    (WIDTH / rect.width);



  const my =

    (e.clientY - rect.top) *

    (HEIGHT / rect.height);



  const clicked =

    (

      mx >= pauseButton.x &&

      mx <= pauseButton.x + pauseButton.w &&

      my >= pauseButton.y &&

      my <= pauseButton.y + pauseButton.h

    ) ||

    (

      mx >= timeArea.x &&

      mx <= timeArea.x + timeArea.w &&

      my >= timeArea.y &&

      my <= timeArea.y + timeArea.h

    );



  if (!clicked) {

    return false;

  }



  state.paused = true;

  onPauseChange(true);



  return true;

};

  /*
   * HUD 클릭은 아이템 입력과 분리한다.
   * input.ts가 HUD 영역에서 아이템 처리를 건너뛴 뒤
   * 이 handler가 실제 pause 상태를 변경한다.
   */
  canvas.addEventListener(
    "pointerdown",
    onHudPointerDown
  );






  /*

   * Main loop

   */

  function loop() {

    ctx.clearRect(

      0,

      0,

      WIDTH,

      HEIGHT

    );



    drawHud();



    updateGame(

      runtime

    );



    drawConveyor({

      canvas,

      ctx,

      state,



      beltEndX:

        BELT_END_X,



      pauseButton,

      timeArea,



      t,

    });



    drawWarehouse({

      canvas,

      ctx,

      state,



      beltEndX:

        BELT_END_X,



      pauseButton,

      timeArea,



      t,

    });



    drawItems({

      canvas,

      ctx,

      state,



      beltEndX:

        BELT_END_X,



      pauseButton,

      timeArea,



      t,

    });



    drawStackedItems({

      canvas,

      ctx,

      state,



      beltEndX:

        BELT_END_X,



      pauseButton,

      timeArea,



      t,

    });



    drawDropZones({

      canvas,

      ctx,

      state,



      beltEndX:

        BELT_END_X,



      pauseButton,

      timeArea,



      t,

    });



    drawScoreEffects({

      canvas,

      ctx,

      state,



      beltEndX:

        BELT_END_X,



      pauseButton,

      timeArea,



      t,

    });



    animationId =

      requestAnimationFrame(

        loop

      );

  }



  loop();



  /*

   * Public API

   */

  return {

    pause() {

      state.paused =

        true;



      onPauseChange(

        true

      );

    },



    resume() {

      state.paused =

        false;



      state.lastTick =

        Date.now();



      onPauseChange(

        false

      );

    },



    nextStage() {

      state.paused =

        false;



      changeStage(

        runtime,

        state.currentStage + 1

      );

    },



    destroy() {

      cancelAnimationFrame(

        animationId

      );



      if (spawnTimer) {

        clearTimeout(

          spawnTimer

        );

      }



      for (

        const timer of

          spawnTimers

      ) {

        clearTimeout(

          timer

        );

      }



      removeInput();



      canvas.removeEventListener(

        "pointerdown",

        onHudPointerDown

      );

    },

  };

}