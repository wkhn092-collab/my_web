/**
 * Ambient lounge bed, synthesised with the Web Audio API: no audio files, nothing downloaded.
 * Two warm major-ninth chords breathe into each other, with an occasional soft chime from the same scale,
 * all in a gentle reverb. Starts only from a user gesture (the sound toggle) and is never remembered.
 */

const MASTER_LEVEL = 0.11;
/** Phone speakers roll off below ~300 Hz, so the bed needs more level and an octave-up layer to be heard at all. */
const PHONE_MASTER_LEVEL = 0.4;
/** A 4 s stereo convolution plus ~40 oscillators starves a phone's audio thread next to WebGL, so it crackles. */
const REVERB_S = 4;
const PHONE_REVERB_S = 1.6;
const FADE_S = 2.5;
/** One full A → B → A cycle of the chord crossfade. */
const CHORD_CYCLE_S = 28;

/** Fmaj9 and Cmaj9: open, warm, no tension. */
const CHORD_A = [87.31, 130.81, 164.81, 220, 392];
const CHORD_B = [65.41, 130.81, 196, 246.94, 293.66];
/** Chime notes that sit inside each chord. */
const CHIMES_A = [698.46, 783.99, 880, 1046.5, 1318.51];
const CHIMES_B = [783.99, 987.77, 1046.5, 1174.66, 1567.98];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverbIn: GainNode | null = null;
let sources: AudioScheduledSourceNode[] = [];
let cycleStart = 0;
let enabled = false;
let chimeTimer: number | undefined;
let phone = false;

const isPhone = () => window.matchMedia("(pointer: coarse)").matches;

/** iOS mutes Web Audio under the silent switch unless the page declares itself as playback. */
function preferPlaybackSession() {
  const session = (navigator as Navigator & { audioSession?: { type: string } })
    .audioSession;
  if (session) session.type = "playback";
}

function impulse(
  context: AudioContext,
  seconds: number,
  decay: number,
): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return buffer;
}

function padGroup(
  context: AudioContext,
  notes: number[],
  destination: AudioNode,
): GainNode {
  const group = context.createGain();
  group.gain.value = 0.5;
  group.connect(destination);
  notes.forEach((freq, i) => {
    const voice = context.createGain();
    // Bass softer than the middle, top note quietest.
    voice.gain.value = [0.22, 0.2, 0.16, 0.13, 0.08][i] ?? 0.1;
    voice.connect(group);
    // Phones: two voices per note (the fundamental and the octave the speaker can actually play), half the load.
    const layers: [OscillatorType, number, number, number][] = phone
      ? [
          ["sine", -4, 1, 0.7],
          ["sine", 3, 2, 0.9],
        ]
      : [
          ["sine", -4, 1, 0.7],
          ["triangle", 5, 1, 0.3],
        ];
    for (const [type, detune, octave, amount] of layers) {
      const osc = context.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * octave;
      osc.detune.value = detune;
      const level = context.createGain();
      level.gain.value = amount;
      osc.connect(level).connect(voice);
      sources.push(osc);
    }
  });
  return group;
}

function build(context: AudioContext): GainNode {
  const out = context.createGain();
  out.gain.value = 0;
  const compressor = context.createDynamicsCompressor();
  // Phones: one soft-knee stage keeps the louder mix off the speaker's ceiling without pumping.
  compressor.threshold.value = phone ? -10 : -18;
  compressor.knee.value = phone ? 12 : 30;
  compressor.ratio.value = phone ? 4 : 3;
  compressor.release.value = phone ? 0.6 : 0.25;
  out.connect(compressor).connect(context.destination);

  const reverb = context.createConvolver();
  reverb.buffer = impulse(context, phone ? PHONE_REVERB_S : REVERB_S, 2.6);
  const wet = context.createGain();
  wet.gain.value = 0.55;
  reverb.connect(wet).connect(out);
  reverbIn = context.createGain();
  reverbIn.connect(reverb);

  // Pads go through a slowly breathing low-pass, half dry, half into the reverb.
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = phone ? 2600 : 950;
  filter.Q.value = 0.4;
  filter.connect(out);
  filter.connect(reverbIn);
  const breath = context.createOscillator();
  breath.frequency.value = 0.05;
  const breathDepth = context.createGain();
  breathDepth.gain.value = 320;
  breath.connect(breathDepth).connect(filter.frequency);

  const a = padGroup(context, CHORD_A, filter);
  const b = padGroup(context, CHORD_B, filter);
  const crossfade = context.createOscillator();
  crossfade.frequency.value = 1 / CHORD_CYCLE_S;
  const toA = context.createGain();
  toA.gain.value = 0.5;
  const toB = context.createGain();
  toB.gain.value = -0.5;
  crossfade.connect(toA).connect(a.gain);
  crossfade.connect(toB).connect(b.gain);

  sources.push(breath, crossfade);
  for (const source of sources) source.start();
  cycleStart = context.currentTime;
  return out;
}

function chime(context: AudioContext, freq: number, level: number) {
  if (!reverbIn || !master) return;
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(level, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
  gain.connect(reverbIn);
  gain.connect(master);
  // A pure tone plus a faint bell partial.
  for (const [ratio, amount] of [
    [1, 1],
    [2.76, 0.18],
  ]) {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    const partial = context.createGain();
    partial.gain.value = amount;
    osc.connect(partial).connect(gain);
    osc.start(now);
    osc.stop(now + 3.3);
  }
}

/** Which chord is louder right now, so chimes always fit it. */
function currentChimes(context: AudioContext): number[] {
  const phase = Math.sin(
    (2 * Math.PI * (context.currentTime - cycleStart)) / CHORD_CYCLE_S,
  );
  return phase >= 0 ? CHIMES_A : CHIMES_B;
}

function scheduleChime() {
  window.clearTimeout(chimeTimer);
  chimeTimer = window.setTimeout(
    () => {
      if (!enabled || !ctx || ctx.state !== "running") return;
      const notes = currentChimes(ctx);
      chime(
        ctx,
        notes[Math.floor(Math.random() * notes.length)],
        phone ? 0.16 : 0.05,
      );
      scheduleChime();
    },
    3500 + Math.random() * 5000,
  );
}

export async function startAmbient(): Promise<boolean> {
  if (typeof window === "undefined" || !("AudioContext" in window))
    return false;
  try {
    preferPlaybackSession();
    if (!ctx) {
      phone = isPhone();
      // "playback" asks for larger audio buffers: a little more latency, no dropouts when the page is busy.
      ctx = new AudioContext({ latencyHint: phone ? "playback" : "interactive" });
    }
    // Resume inside the tap itself: building the graph first can push it past the gesture on iOS.
    const resumed = ctx.resume();
    master ??= build(ctx);
    await resumed;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(
      phone ? PHONE_MASTER_LEVEL : MASTER_LEVEL,
      now + FADE_S,
    );
    enabled = true;
    scheduleChime();
    return true;
  } catch {
    enabled = false;
    return false;
  }
}

export function stopAmbient() {
  enabled = false;
  window.clearTimeout(chimeTimer);
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.8);
  const context = ctx;
  window.setTimeout(() => {
    if (!enabled) context.suspend().catch(() => undefined);
  }, 900);
}

/** Pauses with the tab; resumes only if the visitor had it on. */
export function setAmbientHidden(hidden: boolean) {
  if (!ctx) return;
  if (hidden) ctx.suspend().catch(() => undefined);
  else if (enabled) ctx.resume().catch(() => undefined);
}

/** A very soft chime for hovers, in tune with the bed, only while it is on. */
export function playTick(pitch = 1) {
  if (!enabled || !ctx || ctx.state !== "running") return;
  const notes = currentChimes(ctx);
  const index = Math.min(
    notes.length - 1,
    Math.max(0, Math.round((pitch - 0.8) * 6)),
  );
  chime(ctx, notes[index] * 2, phone ? 0.03 : 0.012);
}

export function disposeAmbient() {
  enabled = false;
  window.clearTimeout(chimeTimer);
  for (const source of sources) {
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
  }
  sources = [];
  master = null;
  reverbIn = null;
  ctx?.close().catch(() => undefined);
  ctx = null;
}
