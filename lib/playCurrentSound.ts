export function playCorrectSound() {
  const ctx = getContext();

  [
    { f: 880, t: 0 },
    { f: 1175, t: 0.12 }
  ].forEach(({ f, t }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = f;

    gain.gain.value = 0.18;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + t);

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + t + 0.25
    );

    osc.stop(ctx.currentTime + t + 0.25);
  });
}