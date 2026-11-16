import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, X } from "lucide-react";
import { useApp } from "../../stores/app-store";
import { useI18n } from "../../i18n";
import miniStyles from "./mini-timer.css?inline";
import WorldScene, { useColorMode } from "../worlds/WorldScene";
import { useWorldAppearance } from "../worlds/world-preview";
import { worldTokens, worldById } from "./worlds";
import { remaining } from "./domain/timer-engine";
import { timerTabTitle } from "./domain/timer-tab";
interface PictureWindow extends Window {
  documentPictureInPicture?: {
    requestWindow: (options: {
      width: number;
      height: number;
    }) => Promise<Window>;
  };
}
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
        <WorldScene world={appearance.world} mode={colorMode} />
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
  const { language } = useI18n();
  const [popup, setPopup] = useState<Window | null>(null);
  const [message, setMessage] = useState("");
  const opened = useRef<Window | null>(null);
  const opening = useRef(false);
  useEffect(
    () => () => {
      opened.current?.close();
    },
    [],
  );
  const open = async () => {
    if (opened.current && !opened.current.closed) {
      opened.current.focus();
      return;
    }
    if (opening.current) return;
    opening.current = true;
    try {
      const api = (window as PictureWindow).documentPictureInPicture;
      const child = api
        ? await api.requestWindow({ width: 280, height: 160 })
        : window.open("", "focus-flow-timer", "popup,width=280,height=160");
      if (!child) throw new Error("blocked");
      const style = child.document.createElement("style");
      style.textContent = miniStyles;
      child.document.head.appendChild(style);
      child.document.documentElement.lang = language;
      child.addEventListener(
        "pagehide",
        () => {
          opened.current = null;
          setPopup(null);
        },
        { once: true },
      );
      opened.current = child;
      setPopup(child);
      setMessage(
        api
          ? ""
          : language === "vi"
            ? "Đã mở cửa sổ mini. Trình duyệt này không hỗ trợ ghim nổi trên mọi cửa sổ."
            : "Mini window opened. This browser cannot keep it above all windows.",
      );
    } catch {
      setMessage(
        language === "vi"
          ? "Hãy cho phép cửa sổ bật lên để mở đồng hồ mini."
          : "Allow pop-ups to open the mini timer.",
      );
    } finally {
      opening.current = false;
    }
  };
  useEffect(() => {
    const request = () => void open();
    window.addEventListener("focus-flow:open-mini", request);
    return () => window.removeEventListener("focus-flow:open-mini", request);
  });
  return (
    <>
      {message && (
        <div className="mini-message" role="status">
          {message}
          <button
            onClick={() => setMessage("")}
            aria-label={
              language === "vi" ? "Đóng thông báo" : "Dismiss notification"
            }
          >
            <X size={16} />
          </button>
        </div>
      )}
      {popup &&
        !popup.closed &&
        createPortal(
          <TimerContents
            popup={popup}
            onClose={() => {
              popup.close();
              setPopup(null);
              opened.current = null;
            }}
          />,
          popup.document.body,
        )}
    </>
  );
}
