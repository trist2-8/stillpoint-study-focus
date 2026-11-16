import { Aperture, PanelsTopLeft, Scan, BookOpen } from "lucide-react";
import { useWorldAppearance, openWorldGallery } from "./world-preview";
import { useApp } from "../../stores/app-store";
import { worldById } from "../focus/worlds";
import { useI18n } from "../../i18n";
export function WorldButton() {
  const { language } = useI18n();
  return (
    <button
      type="button"
      className="world-open-button"
      onClick={openWorldGallery}
    >
      <Aperture size={18} />
      {language === "vi" ? "Đổi thế giới" : "Change world"}
    </button>
  );
}
export default function WorldControls({
  focusPage = false,
}: {
  focusPage?: boolean;
}) {
  const appearance = useWorldAppearance();
  const { language } = useI18n();
  const world = worldById(appearance.world);
  return (
    <div className="world-toolbar">
      <div className="world-identity">
        <Aperture size={18} />
        <span>{language === "vi" ? world.vi : world.en}</span>
        <small>{language === "vi" ? "Không gian của bạn" : "Your space"}</small>
      </div>
      <div className="world-toolbar-actions">
        {focusPage && (
          <div
            className="world-view-toggle"
            role="group"
            aria-label={language === "vi" ? "Cách xem" : "Study view"}
          >
            {(["world", "desk"] as const).map((view) => (
              <button
                key={view}
                type="button"
                aria-pressed={(appearance.studyView ?? "world") === view}
                onClick={() =>
                  useApp.getState().appearanceSave({ studyView: view })
                }
              >
                {view === "world" ? (
                  <Scan size={16} />
                ) : (
                  <PanelsTopLeft size={16} />
                )}{" "}
                {language === "vi"
                  ? view === "world"
                    ? "Toàn cảnh"
                    : "Bàn học"
                  : view === "world"
                    ? "Immersive"
                    : "Desk"}
              </button>
            ))}
          </div>
        )}
        <WorldButton />
        {focusPage && (
          <button
            type="button"
            className="world-notebook-toggle"
            onClick={() =>
              window.dispatchEvent(new Event("focus-flow:toggle-notes"))
            }
          >
            <BookOpen size={17} />
            {language === "vi" ? "Sổ học" : "Notebook"}
          </button>
        )}
      </div>
    </div>
  );
}
