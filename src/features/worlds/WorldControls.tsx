import { useRoomUi } from "./room-ui";
import { Link } from "react-router-dom";
import { SoundLauncher } from "../sound/SoundMixer";
import {
  Aperture,
  PanelsTopLeft,
  Scan,
  BookOpen,
  Settings,
  ListTodo,
  ChartNoAxesCombined,
} from "lucide-react";
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
  const roomUi = useRoomUi();
  const { language } = useI18n();
  const world = worldById(appearance.world);
  return (
    <div className="world-toolbar">
      <div className="world-identity">
        <Link className="room-brand" to="/">
          Focus Flow
        </Link>
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
        {focusPage && appearance.studyView !== "desk" && (
          <button
            type="button"
            className="room-quiet-toggle"
            aria-pressed={roomUi.quiet}
            onClick={roomUi.toggleQuiet}
          >
            <Scan size={16} />
            {language === "vi"
              ? roomUi.quiet
                ? "Quay lại học"
                : "Ngắm phòng"
              : roomUi.quiet
                ? "Back to study"
                : "Room view"}
          </button>
        )}
        <WorldButton />
        <SoundLauncher />
        {focusPage && (
          <nav
            className="room-navigation"
            aria-label={
              language === "vi" ? "Điều hướng chính" : "Main navigation"
            }
          >
            <Link
              to="/tasks"
              title={language === "vi" ? "Việc học" : "Study tasks"}
            >
              <ListTodo size={18} />
              <span>{language === "vi" ? "Việc học" : "Study tasks"}</span>
            </Link>
            <Link
              to="/notebook"
              title={language === "vi" ? "Sổ học" : "Notebook"}
            >
              <BookOpen size={18} />
              <span>{language === "vi" ? "Sổ học" : "Notebook"}</span>
            </Link>
            <Link
              to="/insights"
              title={language === "vi" ? "Tổng kết" : "Reflection"}
            >
              <ChartNoAxesCombined size={18} />
              <span>{language === "vi" ? "Tổng kết" : "Reflection"}</span>
            </Link>
            <button
              type="button"
              aria-label={language === "vi" ? "Mở cài đặt" : "Open settings"}
              onClick={() =>
                window.dispatchEvent(new Event("focus-flow:settings"))
              }
            >
              <Settings size={18} />
              <span>{language === "vi" ? "Cài đặt" : "Settings"}</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
