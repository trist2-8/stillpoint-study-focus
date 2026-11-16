import {
  Bird,
  Waves,
  Wind,
  Flame,
  Coffee,
  Moon,
  AudioLines,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Modal, Button } from "../../components/ui";
import { useCopy } from "../personal/copy";
import { soundTracks, soundPresets } from "./sound-catalog";
import { useSoundMixer } from "./sound-store";
const icons = {
  bird: Bird,
  water: Waves,
  wind: Wind,
  fire: Flame,
  coffee: Coffee,
  moon: Moon,
  noise: AudioLines,
};
export function SoundLauncher() {
  const copy = useCopy();
  const mixer = useSoundMixer();
  const count = mixer.paused ? 0 : mixer.selected.length;
  return (
    <button
      type="button"
      className="world-open-button sound-launcher"
      onClick={() => window.dispatchEvent(new Event("focus-flow:sounds"))}
    >
      <Volume2 size={18} />
      {copy("Âm thanh", "Sounds")}
      {count > 0 && (
        <span
          className="sound-count"
          aria-label={copy("Số âm đang phát", "Playing sounds")}
        >
          {count}
        </span>
      )}
    </button>
  );
}
export default function SoundMixer({ onClose }: { onClose: () => void }) {
  const copy = useCopy();
  const mixer = useSoundMixer();
  const active = !mixer.paused && mixer.selected.length > 0;
  return (
    <Modal
      title={copy("Âm thanh cho buổi học", "Sound for your session")}
      className="sound-dialog"
      onClose={onClose}
    >
      <p className="sound-intro">
        {copy(
          "Chọn một tiếng, hoặc phối nhiều lớp theo ý bạn. Âm thanh vẫn tiếp tục khi chuyển trang.",
          "Choose one sound or blend several layers. Your mix keeps playing across pages.",
        )}
      </p>
      <div className="sound-presets">
        {soundPresets.map((preset) => (
          <button
            key={preset.en}
            type="button"
            onClick={() => mixer.setMix(preset.levels)}
          >
            {copy(preset.vi, preset.en)}
          </button>
        ))}
      </div>
      <div className="sound-master">
        <Button
          type="button"
          onClick={() => (active ? mixer.pause() : mixer.resume())}
          disabled={!mixer.selected.length}
        >
          {active ? <Pause size={17} /> : <Play size={17} />}{" "}
          {active
            ? copy("Tắt tất cả", "Pause all")
            : copy("Phát bộ trộn", "Play mix")}
        </Button>
        <label>
          {copy("Âm lượng chung", "Master volume")}
          <input
            type="range"
            min="0"
            max="100"
            value={mixer.master}
            onChange={(event) => mixer.setMaster(Number(event.target.value))}
          />
          <output>{mixer.master}%</output>
        </label>
      </div>
      <div className="sound-track-list">
        {soundTracks.map((track) => {
          const Icon = icons[track.icon];
          const selected = mixer.selected.includes(track.id);
          return (
            <div
              className="sound-track"
              key={track.id}
              data-active={selected && !mixer.paused}
            >
              <button
                type="button"
                aria-pressed={selected}
                aria-label={copy(track.vi, track.en)}
                onClick={() => mixer.toggle(track.id)}
              >
                <Icon size={21} />
                <span>
                  {copy(track.vi, track.en)}
                  <small>
                    {mixer.pending.includes(track.id)
                      ? copy("Đang tải âm thanh…", "Loading sound…")
                      : track.source
                        ? copy("Bản thu môi trường", "Field recording")
                        : copy(
                            "Âm tổng hợp êm, trầm",
                            "Soft synthesized noise",
                          )}
                  </small>
                </span>
                {selected && !mixer.paused ? (
                  <Volume2 size={17} />
                ) : (
                  <VolumeX size={17} />
                )}
              </button>
              <label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  aria-label={
                    copy("Âm lượng ", "Volume ") + copy(track.vi, track.en)
                  }
                  value={mixer.levels[track.id] ?? 30}
                  onChange={(event) =>
                    mixer.setLevel(track.id, Number(event.target.value))
                  }
                />
                <output>{mixer.levels[track.id] ?? 30}%</output>
              </label>
            </div>
          );
        })}
      </div>
      {mixer.error && (
        <p className="error" role="status">
          {copy(
            "Chưa phát được tiếng này. Hãy kiểm tra kết nối hoặc thử một tiếng khác.",
            "This sound could not play. Check your connection or try another sound.",
          )}
        </p>
      )}
      <p className="sound-footnote">
        {copy(
          "Ghi nhớ mức âm lượng, không tự phát khi tải lại trang.",
          "Remembers your levels. Never autoplays after a reload.",
        )}{" "}
        <a href="/audio/SOURCES.md" target="_blank" rel="noreferrer">
          {copy("Nguồn và giấy phép", "Sources and licenses")}
        </a>
      </p>
    </Modal>
  );
}
