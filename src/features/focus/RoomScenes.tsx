import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
export function AmbientAudio() {
  const { language } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [error, setError] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  useEffect(() => {
    if (gain.current) gain.current.gain.value = (volume / 100) * 0.18;
  }, [volume]);
  const toggle = async () => {
    if (playing) {
      await audio.current?.suspend();
      setPlaying(false);
      return;
    }
    try {
      if (!audio.current) {
        const context = new AudioContext();
        audio.current = context;
        const buffer = context.createBuffer(
          1,
          context.sampleRate * 4,
          context.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < samples.length; index++) {
          previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
          samples[index] = previous * 3.5;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        gain.current = context.createGain();
        gain.current.gain.value = (volume / 100) * 0.18;
        source
          .connect(filter)
          .connect(gain.current)
          .connect(context.destination);
        source.start();
      }
      await audio.current.resume();
      setPlaying(true);
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <div className="ambient-control">
      <button
        type="button"
        aria-pressed={playing}
        onClick={() => void toggle()}
      >
        {playing ? <VolumeX size={16} /> : <Volume2 size={16} />}{" "}
        {language === "vi"
          ? playing
            ? "Tắt âm mưa"
            : "Bật âm mưa"
          : playing
            ? "Mute rain"
            : "Play rain"}
      </button>
      <input
        aria-label={language === "vi" ? "Âm lượng mưa" : "Rain volume"}
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
      />
      {error && (
        <small role="status">
          {language === "vi"
            ? "Trình duyệt chưa cho phép phát âm thanh."
            : "Audio playback is unavailable."}
        </small>
      )}
    </div>
  );
}
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
