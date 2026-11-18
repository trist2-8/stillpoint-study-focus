import { create } from "zustand";
import { soundTracks, isSoundId, type SoundId } from "./sound-catalog";
const key = "focus-flow-sound-mix";
export function normalizeMix(value: unknown): {
  master: number;
  levels: Partial<Record<SoundId, number>>;
  selected: SoundId[];
} {
  const fallback = { master: 45, levels: {}, selected: [] as SoundId[] };
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  const master =
    typeof record.master === "number" && Number.isFinite(record.master)
      ? Math.max(0, Math.min(100, record.master))
      : 45;
  const levels: Partial<Record<SoundId, number>> = {};
  if (record.levels && typeof record.levels === "object")
    for (const [id, level] of Object.entries(record.levels)) {
      if (isSoundId(id) && typeof level === "number" && Number.isFinite(level))
        levels[id] = Math.max(0, Math.min(100, level));
    }
  return {
    master,
    levels,
    selected: Array.isArray(record.selected)
      ? [...new Set(record.selected.filter(isSoundId))]
      : [],
  };
}
function loadMix() {
  try {
    return normalizeMix(JSON.parse(localStorage.getItem(key) ?? "null"));
  } catch {
    return normalizeMix(null);
  }
}
type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";
const players = new Map<SoundId, HTMLAudioElement>();
const generations = new Map<SoundId, number>();
let noise: AudioContext | null = null;
let noiseGain: GainNode | null = null;
function updateTrack(id: SoundId, status: PlaybackState) {
  useSoundMixer.setState((state) => ({
    states: { ...state.states, [id]: status },
    pending:
      status === "loading"
        ? [...state.pending.filter((item) => item !== id), id]
        : state.pending.filter((item) => item !== id),
  }));
}
function volumeFor(id: SoundId) {
  const state = useSoundMixer.getState();
  return ((state.master / 100) * (state.levels[id] ?? 30)) / 100;
}
function stop(id: SoundId) {
  generations.set(id, (generations.get(id) ?? 0) + 1);
  if (id === "brown-noise") void noise?.suspend();
  else players.get(id)?.pause();
  updateTrack(id, "paused");
}
async function startTrack(id: SoundId) {
  const state = useSoundMixer.getState();
  if (
    state.paused ||
    !state.selected.includes(id) ||
    ["playing", "loading"].includes(state.states[id] ?? "idle")
  )
    return;
  const generation = (generations.get(id) ?? 0) + 1;
  generations.set(id, generation);
  updateTrack(id, "loading");
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    let playback: Promise<void>;
    if (id === "brown-noise") {
      if (!noise) {
        noise = new AudioContext();
        const buffer = noise.createBuffer(
          1,
          noise.sampleRate * 8,
          noise.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < samples.length; index++) {
          previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
          samples[index] = previous * 3.5;
        }
        const source = noise.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        noiseGain = noise.createGain();
        source.connect(noiseGain).connect(noise.destination);
        source.start();
      }
      noiseGain!.gain.value = volumeFor(id) * 0.35;
      playback = noise.resume();
    } else {
      let player = players.get(id);
      if (!player) {
        player = new Audio(
          soundTracks.find((track) => track.id === id)!.source!,
        );
        player.loop = true;
        player.preload = "none";
        players.set(id, player);
      }
      player.volume = volumeFor(id);
      playback = player.play();
    }
    await Promise.race([
      playback,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("timeout")), 4500);
      }),
    ]);
    if (generations.get(id) !== generation) return;
    const current = useSoundMixer.getState();
    if (current.paused || !current.selected.includes(id)) {
      stop(id);
      return;
    }
    updateTrack(id, "playing");
  } catch {
    if (generations.get(id) !== generation) return;
    const player = players.get(id);
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
      players.delete(id);
    }
    if (id === "brown-noise") void noise?.suspend();
    updateTrack(id, "error");
    useSoundMixer.setState({ error: id });
  } finally {
    clearTimeout(timeout);
  }
}
function synchronize() {
  const state = useSoundMixer.getState();
  for (const track of soundTracks) {
    if (state.paused || !state.selected.includes(track.id)) {
      if (
        state.states[track.id] === "playing" ||
        state.states[track.id] === "loading"
      )
        stop(track.id);
    } else void startTrack(track.id);
  }
}
interface Mixer {
  master: number;
  levels: Partial<Record<SoundId, number>>;
  selected: SoundId[];
  paused: boolean;
  error: SoundId | null;
  pending: SoundId[];
  states: Partial<Record<SoundId, PlaybackState>>;
  setMaster: (value: number) => void;
  setLevel: (id: SoundId, value: number) => void;
  toggle: (id: SoundId) => void;
  retry: (id: SoundId) => void;
  pause: () => void;
  resume: () => void;
  setMix: (levels: Partial<Record<SoundId, number>>) => void;
}
export const useSoundMixer = create<Mixer>((set, get) => ({
  ...loadMix(),
  paused: true,
  error: null,
  pending: [],
  states: {},
  setMaster: (value) => {
    set({ master: Math.max(0, Math.min(100, value)) });
    for (const [id, player] of players) player.volume = volumeFor(id);
    if (noiseGain) noiseGain.gain.value = volumeFor("brown-noise") * 0.35;
  },
  setLevel: (id, value) => {
    set({
      levels: { ...get().levels, [id]: Math.max(0, Math.min(100, value)) },
    });
    const player = players.get(id);
    if (player) player.volume = volumeFor(id);
    if (id === "brown-noise" && noiseGain)
      noiseGain.gain.value = volumeFor(id) * 0.35;
  },
  toggle: (id) => {
    set({
      selected: get().selected.includes(id)
        ? get().selected.filter((item) => item !== id)
        : [...get().selected, id],
      paused: false,
      error: null,
    });
    synchronize();
  },
  retry: (id) => {
    set({ paused: false, error: null });
    void startTrack(id);
  },
  pause: () => {
    set({ paused: true });
    synchronize();
  },
  resume: () => {
    set({ paused: false, error: null });
    synchronize();
  },
  setMix: (levels) => {
    set({
      levels: { ...get().levels, ...levels },
      selected: Object.keys(levels).filter(isSoundId),
      paused: false,
      error: null,
    });
    synchronize();
  },
}));
useSoundMixer.subscribe((state, previous) => {
  if (
    state.master === previous.master &&
    state.levels === previous.levels &&
    state.selected === previous.selected
  )
    return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        master: state.master,
        levels: state.levels,
        selected: state.selected,
      }),
    );
  } catch {
    return;
  }
});
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    for (const player of players.values()) player.pause();
    void noise?.close();
  });
