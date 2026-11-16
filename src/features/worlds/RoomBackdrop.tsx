import { useState } from "react";
import WorldScene from "./WorldScene";
import { defaultRoomPhotos, useRoomImages } from "./room-images";
import type { StudyWorldId } from "../../types";
export default function RoomBackdrop({
  world,
  mode = "dark",
}: {
  world: StudyWorldId;
  mode?: "light" | "dark";
}) {
  const images = useRoomImages();
  const source =
    images.preview[world] ?? images.urls[world] ?? defaultRoomPhotos[world];
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className="room-backdrop">
      {source && source !== failed ? (
        <img
          className="room-photo"
          src={source}
          alt=""
          data-scene-world={world}
          onError={() => setFailed(source)}
        />
      ) : (
        <WorldScene world={world} mode={mode} />
      )}
    </div>
  );
}
