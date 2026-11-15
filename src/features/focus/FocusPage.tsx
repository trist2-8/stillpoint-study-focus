import { ScenePhoto, AmbientAudio } from "./RoomScenes";
import { trf, tr, useI18n, locale } from "../../i18n";
import { useEffect, useMemo, useState } from "react";
import {
  PictureInPicture2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Bell,
  CalendarDays,
  MoreVertical,
  Folder,
  ChevronRight,
  Sun,
} from "lucide-react";
import { useApp } from "../../stores/app-store";
import {
  Button,
  ConfirmDialog,
  IconButton,
  ProgressBar,
} from "../../components/ui";
import { remaining, nextMode } from "./domain/timer-engine";
import {
  aggregate,
  formatMinutes,
  streak,
} from "../analytics/domain/analytics-calculations";
import ActivityHeatmap from "../analytics/ActivityHeatmap";
import { Link } from "react-router-dom";
import type { Mode } from "../../types";
import ReferenceRoom from "./illustrations/ReferenceRoom";
import GrowthPlant from "./illustrations/GrowthPlant";
import { TaskForm } from "../tasks/TaskForm";

export default function FocusPage() {
  const { language } = useI18n();
  const modeName: Record<Mode, string> = {
    FOCUS: tr("Phiên tập trung"),
    SHORT_BREAK: tr("Nghỉ ngắn"),
    LONG_BREAK: tr("Nghỉ dài"),
  };

  const { timer, settings, sessions, tasks } = useApp();
  const [now, setNow] = useState(Date.now());
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [confirm, setConfirm] = useState<null | (() => void)>(null);
  useEffect(() => {
    const tick = () => {
      useApp.getState().tick();
      setNow(Date.now());
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);
  const ms = remaining(timer, { now: () => now });
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const today = new Date(now).toDateString();
  const week = useMemo(
    () => aggregate(sessions, 7, new Date(today)),
    [sessions, today, language],
  );
  const activity = useMemo(
    () => aggregate(sessions, 30, new Date(today)),
    [sessions, today, language],
  );
  const completed = sessions.filter(
    (s) => s.type === "FOCUS" && s.status === "COMPLETED",
  ).length;
  const activeTask = tasks.find((t) => t.id === timer.currentTaskId);
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const next = nextMode(timer.mode, completed, settings.longBreakInterval);
  const request = (fn: () => void) =>
    timer.status === "RUNNING" || timer.status === "PAUSED"
      ? setConfirm(() => fn)
      : fn();

  const totalMinutes = sessions
    .filter((s) => s.type === "FOCUS" && s.status === "COMPLETED")
    .reduce((sum, s) => sum + s.actualDurationMs / 60000, 0);
  const startLabel =
    timer.status === "RUNNING"
      ? tr("Tạm dừng")
      : timer.status === "PAUSED"
        ? tr("Tiếp tục")
        : timer.status === "COMPLETED"
          ? trf("Tiếp theo: {0}", [modeName[next]])
          : timer.mode === "FOCUS"
            ? tr("Bắt đầu tập trung")
            : tr("Bắt đầu nghỉ");
  const notifications = async () => {
    if (!("Notification" in window)) {
      useApp.getState().notify(tr("Trình duyệt này không hỗ trợ thông báo."));
      return;
    }
    const permission = await Notification.requestPermission();
    useApp.getState().settingsSave({
      ...settings,
      notificationEnabled: permission === "granted",
    });
    useApp
      .getState()
      .notify(
        permission === "granted"
          ? tr("Đã bật thông báo kết thúc phiên.")
          : tr("Bạn có thể bật thông báo trong cài đặt trình duyệt."),
      );
  };
  return (
    <div className="flow-focus-page">
      <header className="flow-header">
        <div className="flow-welcome">
          <Sun className="sun-badge" />
          <div>
            <h1>{tr("Một khoảng yên để học.")}</h1>
            <span>{tr("Chọn một việc, dành trọn một phiên.")}</span>
          </div>
        </div>
        <div className="flow-top-actions">
          <time dateTime={new Date(now).toISOString()}>
            <CalendarDays size={23} />
            {new Date(now).toLocaleDateString(locale(), {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <IconButton
            label={tr("Bật thông báo")}
            onClick={() => void notifications()}
          >
            <Bell />
          </IconButton>
        </div>
      </header>
      <section className="flow-hero">
        <div className="flow-room-wrap" data-scene={settings.scene ?? "study"}>
          <div className="flow-scene">
            <blockquote className="flow-quote">
              {tr("Từng trang một.")}
              <br />
              {tr("Từng bước một.")}
            </blockquote>
            {settings.scene && settings.scene !== "study" ? (
              <ScenePhoto />
            ) : (
              <ReferenceRoom
                status={timer.status}
                mode={timer.mode}
                companion={settings.companionEnabled !== false}
              />
            )}
            <AmbientAudio />
          </div>
          <div className="flow-orb-area">
            <div
              className="flow-orb focus-orb"
              data-status={timer.status}
              data-mode={timer.mode}
            >
              <div className="orb-glow orb-halo" />
              <svg viewBox="0 0 400 400" aria-hidden="true">
                <defs>
                  <linearGradient id="ring-purple" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#ab73ff" />
                    <stop offset=".55" stopColor="#8050f7" />
                    <stop offset="1" stopColor="#e5b4ff" />
                  </linearGradient>
                </defs>
                <circle cx="200" cy="200" r="184" className="orb-track" />
                <circle
                  cx="200"
                  cy="200"
                  r="184"
                  className="orb-progress"
                  strokeDasharray={2 * Math.PI * 184}
                  strokeDashoffset={
                    2 * Math.PI * 184 * (1 - ms / timer.durationMs)
                  }
                />
                <circle cx="254" cy="24" r="11" className="orb-dot" />
              </svg>
              <div className="orb-content">
                <select
                  aria-label={tr("Chế độ phiên")}
                  value={timer.mode}
                  onChange={(e) =>
                    request(() =>
                      useApp.getState().setMode(e.target.value as Mode),
                    )
                  }
                >
                  {Object.entries(modeName).map(([value, name]) => (
                    <option key={value} value={value}>
                      {name}
                    </option>
                  ))}
                </select>
                <strong
                  role="timer"
                  aria-label={`${modeName[timer.mode]} ${display}`}
                >
                  {display}
                </strong>
                <span>
                  {timer.mode === "FOCUS"
                    ? tr("Từng bước một.")
                    : tr("Nghỉ ngơi một chút.")}
                </span>
              </div>
            </div>
            <div className="task-picker">
              <button
                className="flow-current-task"
                onClick={() => setChoosing(!choosing)}
                aria-expanded={choosing}
              >
                <Folder size={22} />
                <span>
                  {activeTask?.title ?? tr("Chọn việc cho phiên này")}
                </span>
                <ChevronRight size={22} />
              </button>
              {choosing && (
                <div className="task-picker-menu">
                  {tasks
                    .filter((t) => !t.isCompleted)
                    .map((task) => (
                      <button
                        key={task.id}
                        onClick={() =>
                          request(() => {
                            useApp.getState().selectTask(task.id);
                            setChoosing(false);
                          })
                        }
                      >
                        {task.title}
                      </button>
                    ))}
                  <button
                    onClick={() => {
                      setChoosing(false);
                      setAdding(true);
                    }}
                  >
                    {tr("+ Thêm việc học")}
                  </button>
                </div>
              )}
            </div>
            <div className="flow-controls">
              <Button
                primary
                aria-label={startLabel}
                onClick={() =>
                  useApp
                    .getState()
                    .timerAction(
                      timer.status === "RUNNING"
                        ? "pause"
                        : timer.status === "COMPLETED"
                          ? "next"
                          : "start",
                    )
                }
              >
                {timer.status === "RUNNING" ? (
                  <Pause fill="currentColor" />
                ) : (
                  <Play fill="currentColor" />
                )}
                {timer.status === "RUNNING"
                  ? tr("Tạm dừng")
                  : timer.status === "PAUSED"
                    ? tr("Tiếp tục")
                    : timer.status === "COMPLETED"
                      ? tr("Tiếp theo")
                      : tr("Bắt đầu")}
              </Button>
              <IconButton
                label={tr("Đặt lại phiên")}
                onClick={() =>
                  request(() => useApp.getState().timerAction("reset"))
                }
              >
                <RotateCcw />
              </IconButton>
              <IconButton
                label={tr("Bỏ qua phiên")}
                onClick={() =>
                  request(() => useApp.getState().timerAction("skip"))
                }
              >
                <SkipForward />
              </IconButton>
            </div>
            <div className="floating-control">
              <button
                className="button"
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("focus-flow:open-mini"))
                }
              >
                <PictureInPicture2 size={18} />
                {language === "vi" ? "Đồng hồ nổi" : "Floating timer"}
              </button>
            </div>
            <p className="flow-cycle-note">
              {settings.autoStartBreaks && settings.autoStartFocus
                ? tr("Tự động lặp chu kỳ · Nghỉ dài sau mỗi ") +
                  settings.longBreakInterval +
                  tr(" phiên")
                : tr("Chuyển phiên theo cài đặt của bạn")}
            </p>
          </div>
        </div>
        <aside className="flow-tasks">
          <div className="flow-panel-title">
            <h2>{tr("Việc học của bạn")}</h2>
            <Button primary onClick={() => setAdding(true)}>
              <Plus />
              {tr("Thêm việc")}
            </Button>
          </div>
          <p className="flow-summary">
            <b>{completedTasks}</b> / {tasks.length} {tr("việc đã hoàn thành")}
          </p>
          <ProgressBar
            value={tasks.length ? (completedTasks / tasks.length) * 100 : 0}
            label={tr("Việc học đã hoàn thành")}
          />
          <div className="flow-task-list">
            {tasks.slice(0, 4).map((task) => (
              <div
                className={`flow-task ${task.isCompleted ? "is-done" : ""}`}
                key={task.id}
              >
                <label>
                  <input
                    aria-label={`${task.isCompleted ? tr("Mở lại") : tr("Hoàn thành")} ${task.title}`}
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() =>
                      useApp.getState().putTask({
                        ...task,
                        isCompleted: !task.isCompleted,
                        updatedAt: Date.now(),
                      })
                    }
                  />
                </label>
                <button
                  className="task-title"
                  onClick={() =>
                    request(() => useApp.getState().selectTask(task.id))
                  }
                >
                  {task.title}
                </button>
                {!task.isCompleted && task.priority !== "low" && (
                  <span className={`priority-tag ${task.priority}`}>
                    {task.priority === "high" ? "Cao" : tr("Vừa")}
                  </span>
                )}
                <button
                  className="task-options"
                  aria-label={trf("Sửa {0}", [task.title])}
                  onClick={() => setEditing(task.id)}
                >
                  <MoreVertical size={21} />
                </button>
              </div>
            ))}
            {!tasks.length && (
              <button
                className="flow-empty-task"
                onClick={() => setAdding(true)}
              >
                {tr("Bạn muốn học gì trong phiên này?")}
                <span>{tr("+ Thêm việc học đầu tiên")}</span>
              </button>
            )}
          </div>
          <Link className="flow-link" to="/tasks">
            {tr("Xem tất cả việc học")}
            <ChevronRight size={16} />
          </Link>
        </aside>
      </section>
      <section className="flow-bottom">
        <article className="flow-card progress-card">
          <div className="flow-card-head">
            <h2>{tr("Nhịp học trong tuần")}</h2>
            <span>{tr("7 ngày qua")}</span>
          </div>
          <div
            className="week-chart"
            role="img"
            aria-label={trf("Thời gian học bảy ngày qua: {0}", [
              week
                .map((day) => `${day.label}: ${formatMinutes(day.minutes)}`)
                .join(", "),
            ])}
          >
            {week.map((d) => (
              <div key={d.date}>
                <span
                  title={trf("{0} phút", [d.minutes])}
                  style={{
                    minHeight: d.minutes ? 8 : 0,
                    height: `${(d.minutes / Math.max(1, ...week.map((x) => x.minutes))) * 100}%`,
                  }}
                />
                <small>
                  {new Date(`${d.date}T12:00:00`).toLocaleDateString(locale(), {
                    weekday: "short",
                  })}
                </small>
              </div>
            ))}
          </div>
          {!week.some((day) => day.minutes) && (
            <p className="flow-chart-empty">
              {tr("Hoàn tất một phiên để bắt đầu ghi lại nhịp học.")}
            </p>
          )}
        </article>
        <article className="flow-card analytics-card">
          <div className="flow-card-head">
            <h2>{tr("Tích lũy từng phiên")}</h2>
            <span className="trend-chip">
              {streak(sessions)} {tr("ngày liên tiếp")}
            </span>
          </div>
          <strong className="analytics-number">
            {formatMinutes(totalMinutes)}
          </strong>
          <small>{tr("Thời gian tập trung đã hoàn tất")}</small>
          <span className="analytics-caption">
            {completed} {tr("phiên học · Cây lớn lên sau mỗi phiên hoàn tất.")}
          </span>

          <div className="growth-mini">
            <GrowthPlant completed={completed} />
          </div>
        </article>
        <article className="flow-card heat-card">
          <div className="flow-card-head">
            <h2>{tr("Lịch học của bạn")}</h2>
            <span>{tr("30 ngày qua")}</span>
          </div>
          <ActivityHeatmap days={activity} />
        </article>
      </section>
      {adding && <TaskForm task={null} onClose={() => setAdding(false)} />}
      {editing && (
        <TaskForm
          task={tasks.find((t) => t.id === editing) ?? null}
          onClose={() => setEditing(null)}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title={tr("Rời phiên hiện tại?")}
          message={tr("Phiên chưa hoàn tất sẽ không được tính vào tiến độ.")}
          onClose={() => setConfirm(null)}
          onConfirm={confirm}
        />
      )}
    </div>
  );
}
