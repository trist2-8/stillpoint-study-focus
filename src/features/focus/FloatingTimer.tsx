import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, X } from "lucide-react";
import { useApp } from "../../stores/app-store";
import { useI18n } from "../../i18n";
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
  return (
    <div className="mini-timer">
      <header>
        <img src={new URL("/favicon.svg", location.origin).href} alt="" />
        <span>Focus Flow</span>
        <button
          aria-label={
            language === "vi" ? "Đóng đồng hồ nổi" : "Close floating timer"
          }
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      <span>{mode[timer.mode]}</span>
      <strong role="timer">{display}</strong>
      <p>
        {tasks.find((task) => task.id === timer.currentTaskId)?.title ??
          (language === "vi" ? "Từng bước một." : "One step at a time.")}
      </p>
      <button
        className="mini-play"
        onClick={() => useApp.getState().timerAction(action)}
      >
        {timer.status === "RUNNING" ? <Pause size={18} /> : <Play size={18} />}{" "}
        {language === "vi"
          ? timer.status === "RUNNING"
            ? "Tạm dừng"
            : timer.status === "COMPLETED"
              ? "Tiếp theo"
              : "Tiếp tục"
          : timer.status === "RUNNING"
            ? "Pause"
            : timer.status === "COMPLETED"
              ? "Next"
              : "Resume"}
      </button>
    </div>
  );
}
export default function FloatingTimer() {
  const { language } = useI18n();
  const [popup, setPopup] = useState<Window | null>(null);
  const [message, setMessage] = useState("");
  const opened = useRef<Window | null>(null);
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
    try {
      const api = (window as PictureWindow).documentPictureInPicture;
      const child = api
        ? await api.requestWindow({ width: 360, height: 320 })
        : window.open("", "focus-flow-timer", "popup,width=360,height=320");
      if (!child) throw new Error("blocked");
      const style = child.document.createElement("style");
      style.textContent =
        "*{box-sizing:border-box}body{margin:0;background:#251a3a;color:#f6eaff;font:14px/1.5 system-ui,sans-serif}button{font:inherit;cursor:pointer;border:1px solid #80699e;background:transparent;color:inherit;border-radius:10px;padding:8px;min-height:40px}:focus-visible{outline:3px solid #d1bdff;outline-offset:2px}.mini-timer{padding:18px;display:flex;align-items:center;flex-direction:column;gap:8px}.mini-timer header{display:flex;align-items:center;gap:8px;width:100%;margin-bottom:8px}.mini-timer header img{width:26px;height:26px}.mini-timer header button{margin-left:auto;display:grid;place-items:center}.mini-timer strong{font-size:64px;line-height:1.1;font-variant-numeric:tabular-nums}.mini-timer p{margin:0;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mini-play{margin-top:8px;background:#b495f5;color:#251a3a;border:0;display:flex;align-items:center;justify-content:center;gap:8px;width:100%}";
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
