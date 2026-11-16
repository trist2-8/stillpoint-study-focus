export const soundTracks = [
  {
    id: "birds",
    vi: "Chim trong vườn",
    en: "Garden birds",
    source: "/audio/birds.ogg",
    icon: "bird",
  },
  {
    id: "stream",
    vi: "Suối chảy",
    en: "Flowing stream",
    source: "/audio/stream.ogg",
    icon: "water",
  },
  {
    id: "wind",
    vi: "Gió qua tán lá",
    en: "Wind in the trees",
    source: "/audio/wind.ogg",
    icon: "wind",
  },
  {
    id: "fireplace",
    vi: "Lửa lò sưởi",
    en: "Fireplace",
    source: "/audio/fireplace.ogg",
    icon: "fire",
  },
  {
    id: "coffee-shop",
    vi: "Quán cà phê",
    en: "Coffee shop",
    source: "/audio/coffee-shop.ogg",
    icon: "coffee",
  },
  {
    id: "summer-night",
    vi: "Đêm hè",
    en: "Summer night",
    source: "/audio/summer-night.ogg",
    icon: "moon",
  },
  {
    id: "boat",
    vi: "Mặt nước yên",
    en: "Quiet waters",
    source: "/audio/boat.ogg",
    icon: "water",
  },
  {
    id: "brown-noise",
    vi: "Nhiễu nâu",
    en: "Brown noise",
    source: null,
    icon: "noise",
  },
] as const;
export type SoundId = (typeof soundTracks)[number]["id"];
export const isSoundId = (value: unknown): value is SoundId =>
  soundTracks.some((track) => track.id === value);
export const soundPresets = [
  {
    vi: "Đọc bên cửa sổ",
    en: "Window reading",
    levels: { birds: 20, wind: 18 },
  },
  {
    vi: "Buổi tối ấm",
    en: "Warm evening",
    levels: { fireplace: 35, "summer-night": 15 },
  },
  {
    vi: "Làm bài ở quán",
    en: "Cafe practice",
    levels: { "coffee-shop": 30, "brown-noise": 12 },
  },
] as const;
