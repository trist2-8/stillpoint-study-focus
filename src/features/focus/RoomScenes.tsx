import { useApp } from "../../stores/app-store";
import { useI18n } from "../../i18n";
export const rooms = [
  { id: "study", vi: "Góc học", en: "Study nook", image: null },
  { id: "library", vi: "Thư viện", en: "Library", image: "/rooms/library.jpg" },
  { id: "cafe", vi: "Quán cà phê", en: "Café", image: "/rooms/cafe.jpg" },
  {
    id: "forest",
    vi: "Rừng mưa",
    en: "Rainforest",
    image: "/rooms/forest.jpg",
  },
] as const;
export function ScenePhoto() {
  const { language } = useI18n();
  const scene = useApp((state) => state.settings.scene);
  const room = rooms.find((item) => item.id === scene);
  if (!room?.image) return null;
  return (
    <figure className="scene-photo">
      <img
        src={room.image}
        alt={language === "vi" ? room.vi : room.en}
        width="1200"
        height="800"
      />
      <figcaption>
        {language === "vi" ? room.vi : room.en}
        <span>Unsplash</span>
      </figcaption>
    </figure>
  );
}
