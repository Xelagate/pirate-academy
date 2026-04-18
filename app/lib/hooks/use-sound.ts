// Frequencies
// C5=523.25Hz  E5=659.25Hz  G5=783.99Hz  F2=87.31Hz

export function playChime() {
  const ctx = new AudioContext();
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.09;
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.start(start);
    osc.stop(start + 0.18);
  });
}

export function playFoghorn() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sawtooth";
  osc.frequency.value = 87.31;
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.15);
  gain.gain.setValueAtTime(0.3, t + 0.45);
  gain.gain.linearRampToValueAtTime(0, t + 0.65);
  osc.start(t);
  osc.stop(t + 0.65);
}
