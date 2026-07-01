let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

export function playCorrectSound() {
  const ctx = getContext();

  [
    { f: 880, t: 0 },
    { f: 1175, t: 0.12 },
  ].forEach(({ f, t }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = f;

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + t + 0.25
    );

    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.25);
  });
}

export function playWrongSound() {
  const ctx = getContext();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.value = 180;

  osc.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + 0.35
  );

  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}