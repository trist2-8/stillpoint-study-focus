import { useEffect, useState } from "react";
import {
  defaultRoomPhotos,
  roomThumbnails,
  useRoomImages,
} from "./room-images";
import RoomEffects from "./RoomEffects";
import type { StudyWorldId } from "../../types";
export default function RoomBackdrop({
  world,
  mode = "dark",
  animated = false,
  thumbnail = false,
}: {
  world: StudyWorldId;
  mode?: "light" | "dark";
  animated?: boolean;
  thumbnail?: boolean;
}) {
  const images = useRoomImages();
  const custom = images.preview[world] ?? images.urls[world];
  const source =
    custom ?? (thumbnail ? roomThumbnails[world] : defaultRoomPhotos[world]);
  const [failed, setFailed] = useState<string | null>(null);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    if (!animated) return;
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [animated]);
  const actual = source === failed ? defaultRoomPhotos[world] : source;
  return (
    <div
      className="room-backdrop"
      data-world-art={world}
      data-art-mode={mode}
      data-motion={animated && visible && !custom ? "on" : "off"}
    >
      {actual !== failed && <img
        className="room-photo"
        src={actual}
        alt=""
        data-scene-world={world}
        decoding="async"
        loading={thumbnail ? "lazy" : "eager"}
        onError={() => setFailed(actual)}
      />}
      {animated && !custom && <RoomEffects world={world} />}
    </div>
  );
}
