import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, X } from "lucide-react";
import { useApp } from "../../stores/app-store";
import { useI18n } from "../../i18n";
import { useMiniWindow, closeFloatingTimer } from "./mini-window";
import { useColorMode } from "../worlds/WorldScene";
import RoomBackdrop from "../worlds/RoomBackdrop";
import { useWorldAppearance } from "../worlds/world-preview";
import { worldTokens, worldById } from "./worlds";
import { remaining } from "./domain/timer-engine";
import { timerTabTitle } from "./domain/timer-tab";
function TimerContents({
  popup,
  onClose,
}: {
  popup: Window;
  onClose: () => void;
}) {
  const timer = useApp((state) => state.timer);
  const tasks = useApp((state) => state.tasks);
  const appearance = useWorldAppearance();
  const colorMode = useColorMode(appearance.theme);
  const world = worldById(appearance.world);
  const { language } = useI18n();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = popup.setInterval(() => {
      useApp.getState().tick();
      setNow(Date.now());
    }, 500);
    return () => popup.clearInterval(interval);
  }, [popup]);
  const seconds = Math.ceil(remaining(timer, { now: () => now }) / 1000);
  const display =
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");
  useEffect(() => {
    popup.document.title = timerTabTitle(timer, now);
    popup.document.documentElement.lang = language;
  }, [timer, now, popup, language]);
  const mode =
    language === "vi"
      ? { FOCUS: "Tập trung", SHORT_BREAK: "Nghỉ ngắn", LONG_BREAK: "Nghỉ dài" }
      : {
          FOCUS: "Focus",
          SHORT_BREAK: "Short break",
          LONG_BREAK: "Long break",
        };
  const action =
    timer.status === "RUNNING"
      ? "pause"
      : timer.status === "COMPLETED"
        ? "next"
        : "start";
  const actionLabel =
    language === "vi"
      ? timer.status === "RUNNING"
        ? "Tạm dừng"
        : timer.status === "COMPLETED"
          ? "Tiếp theo"
          : "Tiếp tục"
      : timer.status === "RUNNING"
        ? "Pause"
        : timer.status === "COMPLETED"
          ? "Next"
          : "Resume";
  return (
    <div
      className="mini-timer"
      data-mode={colorMode}
      style={worldTokens(appearance.world, colorMode)}
    >
      <div className="mini-world">
        <RoomBackdrop world={appearance.world} mode={colorMode} />
      </div>
      <span className="mini-phase">{mode[timer.mode]}</span>
      <div className="mini-digits">
        <strong role="timer" aria-label={mode[timer.mode] + " " + display}>
          {display}
        </strong>
      </div>
      <p
        className="mini-task"
        title={tasks.find((task) => task.id === timer.currentTaskId)?.title}
      >
        {tasks.find((task) => task.id === timer.currentTaskId)?.title ??
          (language === "vi" ? world.vi : world.en)}
      </p>
      <div className="mini-actions">
        <button
          className="mini-play"
          aria-label={actionLabel}
          title={actionLabel}
          onClick={() => useApp.getState().timerAction(action)}
        >
          {timer.status === "RUNNING" ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>
        <button
          className="mini-close"
          aria-label={
            language === "vi" ? "Đóng đồng hồ nổi" : "Close floating timer"
          }
          title={language === "vi" ? "Đóng" : "Close"}
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
export default function FloatingTimer() {
  const popup = useMiniWindow((state) => state.popup);
  useEffect(() => () => closeFloatingTimer(), []);
  return popup && !popup.closed
    ? createPortal(
        <TimerContents popup={popup} onClose={closeFloatingTimer} />,
        popup.document.body,
      )
    : null;
}
