import { useEffect, useRef, useState } from "react";
import {
  Star,
  Check,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Upload,
  ArrowUpRight,
} from "lucide-react";
import { Modal, Button } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import { useCopy } from "../personal/copy";
import { useI18n } from "../../i18n";
import { studyWorlds, worldById, type WorldAppearance } from "../focus/worlds";
import { useColorMode } from "./WorldScene";
import RoomBackdrop from "./RoomBackdrop";
import {
  useRoomImages,
  validateRoomImage,
  saveRoomImages,
  defaultRoomPhotos,
} from "./room-images";
import { useWorldPreview } from "./world-preview";
import type { StudyWorldId } from "../../types";
export default function WorldGallery({ onClose }: { onClose: () => void }) {
  const saved = useApp.getState().settings;
  const copy = useCopy();
  const { language } = useI18n();
  const images = useRoomImages();
  const [draft, setDraft] = useState<WorldAppearance>({
    world: useWorldPreview.getState().preview?.world ?? saved.world,
    theme: useWorldPreview.getState().preview?.theme ?? saved.theme,
    palette: useWorldPreview.getState().preview?.palette ?? saved.palette,
    favoriteWorlds: saved.favoriteWorlds ?? [],
    worldMotion: saved.worldMotion !== false,
    studyView: saved.studyView ?? "world",
  });
  const previous = useRef(useWorldPreview.getState().preview);
  const previousImages = useRef(useRoomImages.getState().preview);
  const applied = useRef(false);
  const pending = useRef(new Map<StudyWorldId, { file: File; url: string }>());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mode = useColorMode(draft.theme);
  const selected = worldById(draft.world);
  useEffect(() => {
    useWorldPreview.getState().setPreview(draft);
  }, [draft]);
  useEffect(
    () => () => {
      useWorldPreview
        .getState()
        .setPreview(applied.current ? null : previous.current);
      useRoomImages.getState().setPreview(previousImages.current);
      for (const image of pending.current.values())
        URL.revokeObjectURL(image.url);
    },
    [],
  );
  const apply = async () => {
    setBusy(true);
    setError("");
    try {
      await saveRoomImages(
        [...pending.current].map(([id, image]) => ({
          id,
          blob: image.file,
          name: image.file.name,
        })),
      );
      useApp.getState().appearanceSave({ ...draft, studyView: "world" });
      applied.current = true;
      window.dispatchEvent(new Event("focus-flow:world-applied"));
      onClose();
    } catch {
      setError(
        copy(
          "Chưa lưu được ảnh. Bộ nhớ trình duyệt có thể đã đầy. Hãy thử ảnh nhỏ hơn.",
          "The image could not be saved. Browser storage may be full. Try a smaller image.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  const importImage = async (file: File) => {
    setBusy(true);
    setError("");
    const world = draft.world;
    try {
      await validateRoomImage(file);
      const previous = pending.current.get(world);
      if (previous) URL.revokeObjectURL(previous.url);
      const url = URL.createObjectURL(file);
      pending.current.set(world, { file, url });
      useRoomImages
        .getState()
        .setPreview({ ...useRoomImages.getState().preview, [world]: url });
    } catch {
      setError(
        copy(
          "Chọn ảnh PNG, JPG hoặc WebP, tối đa 10 MB và ít nhất 600 × 360 px.",
          "Choose a PNG, JPG or WebP image up to 10 MB and at least 600 × 360 px.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={copy("Chọn một nơi để học", "Choose a place to study")}
      className="world-gallery-dialog room-library"
      onClose={onClose}
      closeDisabled={busy}
    >
      <div className="room-library-intro">
        <div>
          <p>
            {copy(
              "Phòng của bạn. Nhịp học của bạn.",
              "Your room. Your rhythm.",
            )}
          </p>
          <span>
            {copy(
              "Xem thử một không gian rồi mang phiên học đang có vào đó.",
              "Preview a space, then bring your current session with you.",
            )}
          </span>
        </div>
        <label className="world-favorites-filter">
          <input
            type="checkbox"
            checked={onlyFavorites}
            onChange={(event) => setOnlyFavorites(event.target.checked)}
          />
          <Star size={16} />
          {copy("Chỉ hiện yêu thích", "Favorites only")}
        </label>
      </div>
      <div
        className="room-gallery-grid"
        role="group"
        aria-label={copy("Chọn thế giới", "Choose a world")}
      >
        {studyWorlds
          .filter(
            (item) => !onlyFavorites || draft.favoriteWorlds?.includes(item.id),
          )
          .map((world, index) => (
            <div className="world-choice room-choice" key={world.id}>
              <button
                className="world-choice-select"
                disabled={busy}
                type="button"
                aria-label={language === "vi" ? world.vi : world.en}
                aria-pressed={draft.world === world.id}
                onClick={() =>
                  setDraft({ ...draft, world: world.id, studyView: "world" })
                }
              >
                <div className="room-choice-art">
                  <RoomBackdrop world={world.id} mode={mode} />
                  <span className="room-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {draft.world === world.id && (
                    <Check className="world-choice-check" size={18} />
                  )}
                </div>
                <div className="room-choice-copy">
                  <small>
                    {language === "vi" ? world.categoryVi : world.categoryEn}
                  </small>
                  <h3>{language === "vi" ? world.vi : world.en}</h3>
                  <p>
                    {language === "vi"
                      ? world.descriptionVi
                      : world.descriptionEn}
                  </p>
                  <span className="room-preview-action">
                    {draft.world === world.id
                      ? copy("Đang xem thử", "Previewing")
                      : copy("Xem không gian", "Preview room")}
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="world-favorite"
                disabled={busy}
                aria-pressed={draft.favoriteWorlds?.includes(world.id) ?? false}
                aria-label={
                  (draft.favoriteWorlds?.includes(world.id)
                    ? copy("Bỏ yêu thích ", "Unfavorite ")
                    : copy("Yêu thích ", "Favorite ")) +
                  (language === "vi" ? world.vi : world.en)
                }
                onClick={() =>
                  setDraft({
                    ...draft,
                    favoriteWorlds: draft.favoriteWorlds?.includes(world.id)
                      ? draft.favoriteWorlds.filter((id) => id !== world.id)
                      : [...(draft.favoriteWorlds ?? []), world.id],
                  })
                }
              >
                <Star
                  size={17}
                  fill={
                    draft.favoriteWorlds?.includes(world.id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>
          ))}
      </div>
      {onlyFavorites && !draft.favoriteWorlds?.length && (
        <p className="room-empty" role="status">
          {copy(
            "Chưa có thế giới yêu thích. Bỏ lọc và bấm ngôi sao để chọn.",
            "No favorites yet. Clear the filter and select a star.",
          )}
        </p>
      )}
      <div className="room-personalize">
        <div className="room-image-import">
          <strong>
            {copy("Ảnh riêng cho ", "Your image for ") +
              (language === "vi" ? selected.vi : selected.en)}
          </strong>
          <p>
            {images.urls[draft.world] || images.preview[draft.world]
              ? copy("Đang dùng ảnh của bạn.", "Using your image.")
              : defaultRoomPhotos[draft.world]
                ? copy(
                    "Ảnh minh họa sẵn có. Bạn có thể thay bằng tranh của mình.",
                    "Stock illustration. Replace it with your own artwork.",
                  )
                : copy(
                    "Minh họa cơ bản. Thêm ảnh của bạn để hoàn thiện căn phòng.",
                    "Basic illustration. Add your own artwork to complete this room.",
                  )}
          </p>
          <label className="button room-upload">
            <Upload size={16} />
            {copy("Chọn ảnh cho phòng", "Choose room image")}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importImage(file);
                event.target.value = "";
              }}
            />
          </label>
          <a href="/world-image-prompts.md" download>
            {copy("Tải 6 prompt tạo ảnh", "Download 6 image prompts")}
          </a>
          <small>
            {copy(
              "Ảnh lưu riêng trên trình duyệt này sau khi áp dụng; không tải lên mạng và chưa nằm trong bản sao lưu JSON.",
              "Images stay in this browser after applying. Never uploaded; not included in JSON backups.",
            )}
          </small>
        </div>
        <div className="room-lighting">
          <fieldset className="world-modes">
            <legend>{copy("Ánh sáng giao diện", "Interface lighting")}</legend>
            {(
              [
                ["light", "Sáng", "Light", Sun],
                ["dark", "Tối", "Dark", Moon],
                ["system", "Theo hệ thống", "System", Monitor],
              ] as const
            ).map(([value, vi, en, Icon]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="world-light"
                  checked={draft.theme === value}
                  onChange={() => setDraft({ ...draft, theme: value })}
                />
                <span>
                  <Icon size={16} />
                  {copy(vi, en)}
                </span>
              </label>
            ))}
          </fieldset>
          <label className="world-motion">
            <input
              type="checkbox"
              checked={draft.worldMotion !== false}
              onChange={(event) =>
                setDraft({ ...draft, worldMotion: event.target.checked })
              }
            />
            <Sparkles size={17} />
            {copy("Chuyển động nhẹ", "Gentle motion")}
          </label>
          <small>
            {copy(
              "Tôn trọng chế độ giảm chuyển động của thiết bị. Âm thanh chỉ phát khi bạn bật.",
              "Respects reduced motion. Sounds play only when you choose.",
            )}
          </small>
        </div>
      </div>
      {error && (
        <p className="room-error error" role="alert">
          {error}
        </p>
      )}
      <div className="world-gallery-footer">
        <span>
          {copy(
            "Giữ nguyên đồng hồ và việc đang học.",
            "Keep your timer and current task.",
          )}
        </span>
        <Button type="button" disabled={busy} onClick={onClose}>
          {copy("Hủy xem thử", "Cancel preview")}
        </Button>
        <Button
          primary
          type="button"
          disabled={busy}
          onClick={() => void apply()}
        >
          {busy
            ? copy("Đang lưu…", "Saving…")
            : copy("Áp dụng thế giới", "Apply world")}
        </Button>
      </div>
    </Modal>
  );
}
