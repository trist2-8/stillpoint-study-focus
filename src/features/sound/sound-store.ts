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
const players = new Map<SoundId, HTMLAudioElement>();
let noise: AudioContext | null = null;
let noiseGain: GainNode | null = null;
async function play(id: SoundId, volume: number) {
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
    noiseGain!.gain.value = volume * 0.35;
    await noise.resume();
    return;
  }
  let player = players.get(id);
  if (!player) {
    const track = soundTracks.find((item) => item.id === id)!;
    player = new Audio(track.source!);
    player.loop = true;
    player.preload = "none";
    player.addEventListener("error", () => {
      player!.pause();
      useSoundMixer.setState((state) => ({
        selected: state.selected.filter((item) => item !== id),
        error: id,
      }));
    });
    players.set(id, player);
  }
  player.volume = volume;
  await player.play();
}
function stop(id: SoundId) {
  if (id === "brown-noise") {
    void noise?.suspend();
    return;
  }
  players.get(id)?.pause();
}
function volumeFor(id: SoundId) {
  const state = useSoundMixer.getState();
  return ((state.master / 100) * (state.levels[id] ?? 30)) / 100;
}
let playbackRevision = 0;
async function synchronize() {
  const revision = ++playbackRevision;
  const state = useSoundMixer.getState();
  for (const track of soundTracks)
    if (state.paused || !state.selected.includes(track.id)) stop(track.id);
  if (state.paused) {
    useSoundMixer.setState({ pending: [] });
    return;
  }
  useSoundMixer.setState({ pending: state.selected });
  await Promise.all(
    state.selected.map(async (id) => {
      try {
        await play(id, volumeFor(id));
        const current = useSoundMixer.getState();
        if (
          revision !== playbackRevision &&
          (current.paused || !current.selected.includes(id))
        )
          stop(id);
      } catch {
        const current = useSoundMixer.getState();
        if (
          !current.paused &&
          revision === playbackRevision &&
          current.selected.includes(id)
        ) {
          stop(id);
          useSoundMixer.setState({
            selected: current.selected.filter((item) => item !== id),
            error: id,
          });
        }
      } finally {
        if (revision === playbackRevision)
          useSoundMixer.setState((current) => ({
            pending: current.pending.filter((item) => item !== id),
          }));
      }
    }),
  );
}
interface Mixer {
  master: number;
  levels: Partial<Record<SoundId, number>>;
  selected: SoundId[];
  paused: boolean;
  error: SoundId | null;
  pending: SoundId[];
  setMaster: (value: number) => void;
  setLevel: (id: SoundId, value: number) => void;
  toggle: (id: SoundId) => void;
  pause: () => void;
  resume: () => void;
  setMix: (levels: Partial<Record<SoundId, number>>) => void;
}
export const useSoundMixer = create<Mixer>((set, get) => ({
  ...loadMix(),
  paused: true,
  error: null,
  pending: [],
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
    const selected = get().selected.includes(id)
      ? get().selected.filter((item) => item !== id)
      : [...get().selected, id];
    set({ selected, paused: false, error: null });
    void synchronize();
  },
  pause: () => {
    set({ paused: true });
    void synchronize();
  },
  resume: () => {
    set({ paused: false, error: null });
    void synchronize();
  },
  setMix: (levels) => {
    set({
      levels: { ...get().levels, ...levels },
      selected: Object.keys(levels).filter(isSoundId),
      paused: false,
      error: null,
    });
    void synchronize();
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
