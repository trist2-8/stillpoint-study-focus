import type { StudyWorldId, UserSettings } from "../../types";
export const worldIds: StudyWorldId[] = [
  "lavender",
  "academia",
  "forest",
  "midnight",
  "rainy-cafe",
  "exam",
];
export type WorldAppearance = Pick<
  UserSettings,
  "world" | "theme" | "palette" | "favoriteWorlds" | "worldMotion" | "studyView"
>;
export interface StudyWorld {
  id: StudyWorldId;
  vi: string;
  en: string;
  descriptionVi: string;
  descriptionEn: string;
  categoryVi: string;
  categoryEn: string;
  dark: string[];
  light: string[];
}
export const studyWorlds: StudyWorld[] = [
  {
    id: "lavender",
    vi: "Hiên mây tím",
    en: "Lavender Dreamscape",
    descriptionVi: "Cửa vòm, mây xa và một bàn học quen thuộc.",
    descriptionEn: "An arched window, distant clouds and your familiar desk.",
    categoryVi: "Học hằng ngày",
    categoryEn: "Everyday study",
    dark: [
      "#191621",
      "#272131",
      "#372d45",
      "#f7f0ff",
      "#cec1de",
      "#bda4ed",
      "#4c3b62",
      "#3e3153",
      "#514268",
      "#ac8aaf",
      "#9cbaac",
    ],
    light: [
      "#eee7f5",
      "#fffaff",
      "#e9def4",
      "#30213f",
      "#655176",
      "#754aa8",
      "#c6b3d8",
      "#cdc0e2",
      "#aa92ba",
      "#f5d8ab",
      "#6b907c",
    ],
  },
  {
    id: "academia",
    vi: "Thư viện tĩnh",
    en: "Academia Library",
    descriptionVi: "Kệ sách cao, giấy kem và ánh đèn ấm.",
    descriptionEn: "Tall bookshelves, cream paper and warm lamplight.",
    categoryVi: "Đọc · nghiên cứu",
    categoryEn: "Read · research",
    dark: [
      "#191c18",
      "#272c24",
      "#363d30",
      "#f6efdf",
      "#cfc5b1",
      "#d3b076",
      "#525b46",
      "#586253",
      "#624c39",
      "#e6bd74",
      "#8b9b71",
    ],
    light: [
      "#eae5d7",
      "#fffaf0",
      "#ece6d6",
      "#293025",
      "#56604b",
      "#54643b",
      "#bab69f",
      "#b7c6b0",
      "#947653",
      "#ffe1a3",
      "#6a8254",
    ],
  },
  {
    id: "forest",
    vi: "Nhà bên rừng",
    en: "Forest Quietude",
    descriptionVi: "Một khung cửa lớn, tán lá và ánh sáng dịu.",
    descriptionEn: "A wide window, layered trees and gentle daylight.",
    categoryVi: "Học chậm · học sâu",
    categoryEn: "Slow · deep work",
    dark: [
      "#111e1b",
      "#1c302a",
      "#2a4238",
      "#edf8f0",
      "#c2d6c9",
      "#a3cfb0",
      "#466555",
      "#284c44",
      "#685543",
      "#b1d5ac",
      "#82ad8e",
    ],
    light: [
      "#e3eee6",
      "#f8fcf5",
      "#dceadd",
      "#1d382d",
      "#4a6654",
      "#32694b",
      "#aec4af",
      "#b0d1bb",
      "#987d5d",
      "#f4ecc4",
      "#55896d",
    ],
  },
  {
    id: "midnight",
    vi: "Đài quan sát đêm",
    en: "Midnight Observatory",
    descriptionVi: "Bầu trời sâu, bản đồ sao và ánh trăng trên bàn.",
    descriptionEn: "Deep skies, a star chart and moonlight on your desk.",
    categoryVi: "Học đêm",
    categoryEn: "Night focus",
    dark: [
      "#101626",
      "#1b2540",
      "#293653",
      "#eff4ff",
      "#c1cce5",
      "#a7bbf4",
      "#455775",
      "#111c36",
      "#3b4568",
      "#d2dfff",
      "#7c9fb2",
    ],
    light: [
      "#e5eaf5",
      "#fafbff",
      "#dce3f3",
      "#202e49",
      "#51617f",
      "#415d9f",
      "#b3c0d8",
      "#a8bce0",
      "#7e8cae",
      "#fff4d5",
      "#62869c",
    ],
  },
  {
    id: "rainy-cafe",
    vi: "Quán bên mưa",
    en: "Rainy Café",
    descriptionVi: "Giọt mưa trên kính, đèn hổ phách và một chỗ ngồi riêng.",
    descriptionEn: "Rain on the glass, amber lamps and a seat of your own.",
    categoryVi: "Ngoại ngữ · ghi chú",
    categoryEn: "Language · notes",
    dark: [
      "#221a18",
      "#332723",
      "#47362d",
      "#fff1df",
      "#e0c7b5",
      "#e0ad76",
      "#72543e",
      "#46585b",
      "#815d40",
      "#ffd08a",
      "#869873",
    ],
    light: [
      "#f2e4d5",
      "#fff8ef",
      "#edd9c6",
      "#422b21",
      "#775442",
      "#8a4e27",
      "#cdb197",
      "#b3c9c9",
      "#b88754",
      "#ffe0a6",
      "#78906a",
    ],
  },
  {
    id: "exam",
    vi: "Góc ôn thi",
    en: "Exam Sprint",
    descriptionVi: "Giấy sạch, đường nét rõ và chỉ một việc trước mắt.",
    descriptionEn: "Clean paper, precise lines and one task ahead.",
    categoryVi: "Ôn thi · giải bài",
    categoryEn: "Revision · practice",
    dark: [
      "#181b1e",
      "#242a2e",
      "#343e43",
      "#f1f7f6",
      "#bdcbce",
      "#9acdc4",
      "#536369",
      "#344348",
      "#48565b",
      "#d9e7dd",
      "#8aa49a",
    ],
    light: [
      "#edf0ed",
      "#ffffff",
      "#e5ece8",
      "#1c3030",
      "#4c6460",
      "#29665d",
      "#b5c7bf",
      "#d1dfd9",
      "#a9bdb5",
      "#ffffff",
      "#6d9485",
    ],
  },
];
export function isWorldId(value: unknown): value is StudyWorldId {
  return worldIds.includes(value as StudyWorldId);
}
export function resolveWorld(value: unknown, palette?: unknown): StudyWorldId {
  return isWorldId(value)
    ? value
    : palette === "forest"
      ? "forest"
      : palette === "midnight"
        ? "midnight"
        : "lavender";
}
export function worldById(id: unknown) {
  return studyWorlds.find((world) => world.id === id) ?? studyWorlds[0];
}
export function worldTokens(
  id: unknown,
  mode: "light" | "dark",
): Record<string, string> {
  const world = worldById(id);
  const colors = world[mode];
  const keys = [
    "--background",
    "--surface",
    "--surface-secondary",
    "--text-primary",
    "--text-secondary",
    "--primary",
    "--border",
    "--scene-sky",
    "--scene-wood",
    "--scene-light",
    "--scene-leaf",
  ];
  return {
    ...Object.fromEntries(keys.map((key, index) => [key, colors[index]])),
    "--primary-hover": colors[5],
    "--primary-soft": colors[2],
    "--text-muted": colors[4],
    "--accent": colors[5],
    "--world-font":
      world.id === "exam" ? '"DM Sans",sans-serif' : "Lora,Georgia,serif",
    "--world-radius": world.id === "exam" ? "8px" : "20px",
    "--focus-ring": colors[5],
  };
}
