import { useEffect, useRef, useState } from "react";
import { Star, Check, Sun, Moon, Monitor, Sparkles } from "lucide-react";
import { Modal, Button } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import { useCopy } from "../personal/copy";
import { useI18n } from "../../i18n";
import {
  studyWorlds,
  worldById,
  worldTokens,
  type WorldAppearance,
} from "../focus/worlds";
import WorldScene, { useColorMode } from "./WorldScene";
import { useWorldPreview } from "./world-preview";
export default function WorldGallery({ onClose }: { onClose: () => void }) {
  const saved = useApp.getState().settings;
  const copy = useCopy();
  const { language } = useI18n();
  const [draft, setDraft] = useState<WorldAppearance>({
    world: useWorldPreview.getState().preview?.world ?? saved.world,
    theme: useWorldPreview.getState().preview?.theme ?? saved.theme,
    palette: useWorldPreview.getState().preview?.palette ?? saved.palette,
    favoriteWorlds: saved.favoriteWorlds ?? [],
    worldMotion: saved.worldMotion !== false,
    studyView: saved.studyView ?? "world",
  });
  const previous = useRef(useWorldPreview.getState().preview);
  const applied = useRef(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const mode = useColorMode(draft.theme);
  const world = worldById(draft.world);
  useEffect(() => {
    useWorldPreview.getState().setPreview(draft);
  }, [draft]);
  useEffect(
    () => () =>
      useWorldPreview
        .getState()
        .setPreview(applied.current ? null : previous.current),
    [],
  );
  const apply = () => {
    useApp.getState().appearanceSave(draft);
    applied.current = true;
    window.dispatchEvent(new Event("focus-flow:world-applied"));
    onClose();
  };
  return (
    <Modal
      title={copy("Thế giới học của bạn", "Your study worlds")}
      className="world-gallery-dialog"
      onClose={onClose}
    >
      <div className="world-gallery-layout">
        <div
          className="world-gallery-preview"
          style={worldTokens(world.id, mode)}
        >
          <WorldScene world={world.id} mode={mode} />
          <div className="world-preview-caption">
            <small>
              {copy("Đang xem thử · chưa lưu", "Preview · not saved")}
            </small>
            <h3>{language === "vi" ? world.vi : world.en}</h3>
            <p>
              {language === "vi" ? world.descriptionVi : world.descriptionEn}
            </p>
            <span className="world-preview-clock">25:00</span>
          </div>
        </div>
        <div className="world-gallery-options">
          <p>
            {copy(
              "Một bộ công cụ, nhiều bầu không khí. Đồng hồ và ghi chú vẫn tiếp tục khi bạn chọn.",
              "One set of tools, many atmospheres. Your timer and notes continue while you choose.",
            )}
          </p>
          <label className="world-favorites-filter">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(event) => setOnlyFavorites(event.target.checked)}
            />
            <Star size={16} />
            {copy("Chỉ hiện yêu thích", "Favorites only")}
          </label>
          <div
            className="world-gallery"
            role="group"
            aria-label={copy("Chọn thế giới", "Choose a world")}
          >
            {studyWorlds
              .filter(
                (item) =>
                  !onlyFavorites || draft.favoriteWorlds?.includes(item.id),
              )
              .map((item) => (
                <div className="world-choice" key={item.id}>
                  <button
                    className="world-choice-select"
                    type="button"
                    aria-pressed={draft.world === item.id}
                    aria-label={language === "vi" ? item.vi : item.en}
                    onClick={() => setDraft({ ...draft, world: item.id })}
                  >
                    <WorldScene world={item.id} mode={mode} />
                    <span>
                      <strong>{language === "vi" ? item.vi : item.en}</strong>
                      <small>
                        {language === "vi" ? item.categoryVi : item.categoryEn}
                      </small>
                    </span>
                    {draft.world === item.id && (
                      <Check className="world-choice-check" size={17} />
                    )}
                  </button>
                  <button
                    type="button"
                    className="world-favorite"
                    aria-pressed={draft.favoriteWorlds?.includes(item.id)}
                    aria-label={
                      (draft.favoriteWorlds?.includes(item.id)
                        ? copy("Bỏ yêu thích ", "Unfavorite ")
                        : copy("Yêu thích ", "Favorite ")) +
                      (language === "vi" ? item.vi : item.en)
                    }
                    onClick={() =>
                      setDraft({
                        ...draft,
                        favoriteWorlds: draft.favoriteWorlds?.includes(item.id)
                          ? draft.favoriteWorlds.filter((id) => id !== item.id)
                          : [...(draft.favoriteWorlds ?? []), item.id],
                      })
                    }
                  >
                    <Star
                      size={16}
                      fill={
                        draft.favoriteWorlds?.includes(item.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
              ))}
          </div>
          {onlyFavorites && !draft.favoriteWorlds?.length && (
            <p role="status" aria-live="polite">
              {copy(
                "Chưa có thế giới yêu thích. Bỏ lọc và bấm ngôi sao để chọn.",
                "No favorites yet. Clear the filter and select a star.",
              )}
            </p>
          )}
          <fieldset className="world-modes">
            <legend>{copy("Ánh sáng", "Lighting")}</legend>
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
              checked={draft.worldMotion}
              onChange={(event) =>
                setDraft({ ...draft, worldMotion: event.target.checked })
              }
            />
            <Sparkles size={17} />
            {copy("Chuyển động nhẹ", "Gentle motion")}
          </label>
          <small className="world-motion-note">
            {copy(
              "Tự tắt khi thiết bị bật giảm chuyển động. Âm thanh chỉ phát khi bạn bật.",
              "Respects your device's reduced motion preference. Audio starts only when you choose.",
            )}
          </small>
        </div>
      </div>
      <div className="world-gallery-footer">
        <span>
          {copy(
            "Thay không gian, giữ nguyên phiên học.",
            "Change your space, keep your session.",
          )}
        </span>
        <Button type="button" onClick={onClose}>
          {copy("Hủy xem thử", "Cancel preview")}
        </Button>
        <Button primary type="button" onClick={apply}>
          {copy("Áp dụng thế giới", "Apply world")}
        </Button>
      </div>
    </Modal>
  );
}
