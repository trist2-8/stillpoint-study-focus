import { useRoomUi } from "../worlds/room-ui";
import { useWorldAppearance } from "../worlds/world-preview";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CalendarDays,
  MoreVertical,
  Folder,
  ChevronRight,
  ArrowUpRight,
  PencilLine,
  BookOpen,
} from "lucide-react";
import { useApp } from "../../stores/app-store";
import { trf, tr, useI18n, locale } from "../../i18n";
import { Button, ConfirmDialog, IconButton } from "../../components/ui";
import { remaining, nextMode } from "./domain/timer-engine";
import {
  dateKey,
  formatMinutes,
} from "../analytics/domain/analytics-calculations";
import { TaskForm } from "../tasks/TaskForm";
import RoomBackdrop from "../worlds/RoomBackdrop";
import { useColorMode } from "../worlds/WorldScene";
import FloatingTimerButton from "./FloatingTimerButton";
import Subjects from "../personal/Subjects";
import SessionNotebook, { NextStepNote } from "../personal/SessionNotebook";
import DistractionTray from "../personal/DistractionTray";
import {
  emptyPersonal,
  goals,
  nextStudyTask,
} from "../personal/domain/personal-study";
import { goalNames, useCopy } from "../personal/copy";
import type { Mode } from "../../types";
export default function FocusPage() {
  useI18n();
  const copy = useCopy();
  const appearance = useWorldAppearance();
  const quiet = useRoomUi((state) => state.quiet);
  const stage = useRef<HTMLDivElement>(null);
  const colorMode = useColorMode(appearance.theme);
  const state = useApp();
  const { timer, settings, sessions, tasks } = state;
  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const measure = () =>
      element.style.setProperty(
        "--study-top",
        Math.round(element.getBoundingClientRect().top + window.scrollY) + "px",
      );
    measure();
    const observer = new ResizeObserver(measure);
    const toolbar = document.querySelector(".world-toolbar");
    if (toolbar) observer.observe(toolbar);
    const toast = document.querySelector(".toast");
    if (toast) observer.observe(toast);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [appearance.studyView, quiet, state.toast]);
  const personal = state.personal ?? emptyPersonal;
  const [now, setNow] = useState(Date.now());
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [confirm, setConfirm] = useState<null | (() => void)>(null);
  useEffect(() => {
    const interval = window.setInterval(() => {
      useApp.getState().tick();
      setNow(Date.now());
    }, 500);
    return () => window.clearInterval(interval);
  }, []);
  const modeName: Record<Mode, string> = {
    FOCUS: tr("Phiên tập trung"),
    SHORT_BREAK: tr("Nghỉ ngắn"),
    LONG_BREAK: tr("Nghỉ dài"),
  };
  const ms = remaining(timer, { now: () => now });
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const display =
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");
  const completed = sessions.filter(
    (session) => session.type === "FOCUS",
  ).length;
  const next = nextMode(timer.mode, completed, settings.longBreakInterval);
  const activeTask = tasks.find((task) => task.id === timer.currentTaskId);
  const mainTask = nextStudyTask(
    tasks,
    personal.activeSubjectId,
    timer.currentTaskId,
    sessions,
  );
  const visibleTasks = tasks.filter(
    (task) => (task.subjectId ?? null) === personal.activeSubjectId,
  );
  const todaySessions = sessions.filter(
    (session) => session.type === "FOCUS" && session.dateKey === dateKey(now),
  );
  const todayMinutes = todaySessions.reduce(
    (sum, session) => sum + session.actualDurationMs / 60000,
    0,
  );
  const subject = personal.subjects.find(
    (item) => item.id === personal.activeSubjectId,
  );
  const locked = timer.status === "RUNNING" || timer.status === "PAUSED";
  const request = (operation: () => void) =>
    locked ? setConfirm(() => operation) : operation();
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
  const runTimer = () => {
    if (
      timer.status === "IDLE" &&
      timer.mode === "FOCUS" &&
      mainTask &&
      mainTask.id !== timer.currentTaskId
    )
      useApp.getState().selectTask(mainTask.id);
    useApp
      .getState()
      .timerAction(
        timer.status === "RUNNING"
          ? "pause"
          : timer.status === "COMPLETED"
            ? "next"
            : "start",
      );
  };
  return (
    <div
      className="personal-today"
      data-quiet={quiet}
      data-status={timer.status}
      data-mode={timer.mode}
      data-study-view={appearance.studyView ?? "world"}
      data-notes={timer.mode !== "FOCUS" || timer.status === "COMPLETED"}
    >
      <div className="study-stage" ref={stage}>
        <header className="flow-header today-header">
          <div>
            <span className="today-date">
              <CalendarDays size={16} />
              {new Date(now).toLocaleDateString(locale(), {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <h1>{copy("Hôm nay của bạn.", "Your day, your pace.")}</h1>
            <p>
              {copy(
                "Tiếp nối điều đang học. Từng việc một.",
                "Pick up where you left off. One thing at a time.",
              )}
            </p>
          </div>
          <Link className="today-progress" to="/insights">
            <span>
              {formatMinutes(todayMinutes)}{" "}
              <small>
                / {settings.dailyFocusGoal} {copy("phút hôm nay", "min today")}
              </small>
            </span>
            <span>
              {todaySessions.length} / {settings.dailySessionGoal}{" "}
              {copy("phiên", "sessions")}
              <ArrowUpRight size={17} />
            </span>
          </Link>
        </header>
        <Subjects />
        <div className="personal-workspace">
          <section
            className="flow-room-wrap desk-focus"
            data-scene={settings.scene ?? "study"}
            aria-label={copy("Bàn học hôm nay", "Today's study desk")}
          >
            <div className="desk-intention">
              <div className="intention-heading">
                <BookOpen size={18} />
                <span>
                  {(locked
                    ? personal.subjects.find(
                        (item) => item.id === timer.subjectId,
                      )?.name
                    : subject?.name) ?? copy("Góc học chung", "General study")}
                </span>
              </div>
              <h2>
                {locked && activeTask
                  ? activeTask.title
                  : (mainTask?.title ??
                    copy(
                      "Một khoảng tập trung cho bạn.",
                      "A little time to focus.",
                    ))}
              </h2>
              <p className="desk-guidance">
                {locked
                  ? copy(
                      "Cứ ở lại với việc này. Những việc khác có thể chờ.",
                      "Stay with this task. Everything else can wait.",
                    )
                  : mainTask
                    ? copy(
                        "Việc đang dang dở đã ở đây. Bắt đầu khi bạn sẵn sàng.",
                        "Your unfinished task is here. Begin when you are ready.",
                      )
                    : copy(
                        "Thêm một việc cần học, hoặc bắt đầu một phiên tự do.",
                        "Add a study task, or begin a free focus session.",
                      )}
              </p>
              <NextStepNote taskId={locked ? activeTask?.id : mainTask?.id} />
              <fieldset className="desk-goals">
                <legend>
                  {locked
                    ? copy(
                        "Mục tiêu cho phiên kế tiếp",
                        "Goal for the next session",
                      )
                    : copy("Phiên này mình sẽ…", "This session, I will…")}
                </legend>
                <div>
                  {goals.map((goal) => (
                    <label key={goal}>
                      <input
                        type="radio"
                        name="study-goal"
                        checked={personal.goal === goal}
                        onChange={() => useApp.getState().chooseGoal(goal)}
                      />
                      <span>{copy(...goalNames[goal])}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                className="room-add-task"
                onClick={() => setAdding(true)}
              >
                <Plus size={16} />
                {copy("Thêm việc vào góc học", "Add a task to this space")}
              </button>
              <div className="desk-room">
                <RoomBackdrop
                  world={appearance.world}
                  mode={colorMode}
                  animated
                />
              </div>
              {timer.mode !== "FOCUS" && (
                <p className="break-note">
                  {copy(
                    "Để mắt nghỉ một chút. Bàn học vẫn ở đây khi bạn quay lại.",
                    "Rest your eyes for a moment. Your desk will be here when you return.",
                  )}
                </p>
              )}
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
                    <linearGradient
                      id="ring-purple"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
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
                  aria-label={activeTask?.title ?? tr("Chọn việc cho phiên này")}
                  onClick={() => setChoosing(!choosing)}
                  aria-expanded={choosing}
                >
                  <Folder size={22} />
                  <span title={activeTask?.title ?? tr("Chọn việc cho phiên này")}>
                    {activeTask?.title ?? copy("Chọn việc", "Choose a task")}
                  </span>
                  <ChevronRight size={22} />
                </button>
                {choosing && (
                  <div className="task-picker-menu">
                    {!visibleTasks.some((task) => !task.isCompleted) && (
                      <p className="task-picker-empty">
                        {copy(
                          "Chưa có việc chưa hoàn thành trong góc học này. Thêm một việc hoặc học tự do.",
                          "No unfinished tasks in this space. Add a task or study freely.",
                        )}
                      </p>
                    )}
                    {tasks
                      .filter(
                        (t) =>
                          !t.isCompleted &&
                          (t.subjectId ?? null) === personal.activeSubjectId,
                      )
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
                <Button primary aria-label={startLabel} onClick={runTimer}>
                  {timer.status === "RUNNING" ? (
                    <Pause fill="currentColor" />
                  ) : (
                    <Play fill="currentColor" />
                  )}
                  {startLabel}
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
              <FloatingTimerButton />
              <p className="flow-cycle-note">
                {settings.autoStartBreaks && settings.autoStartFocus
                  ? tr("Tự động lặp chu kỳ · Nghỉ dài sau mỗi ") +
                    settings.longBreakInterval +
                    tr(" phiên")
                  : tr("Chuyển phiên theo cài đặt của bạn")}
              </p>
            </div>
          </section>
          {appearance.studyView === "desk" && <SessionNotebook />}
        </div>
      </div>
      {appearance.studyView !== "desk" &&
        (timer.mode !== "FOCUS" || timer.status === "COMPLETED") && (
          <SessionNotebook />
        )}
      <div className="desk-lower">
        <section className="desk-task-queue" id="room-task-queue">
          <div className="queue-heading">
            <div>
              <h2>
                {copy("Việc học trong không gian này", "Tasks in this space")}
              </h2>
              <p className="flow-summary">
                {visibleTasks.filter((task) => task.isCompleted).length} /{" "}
                {visibleTasks.length} {tr("việc đã hoàn thành")}
              </p>
            </div>
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} />
              {tr("Thêm việc")}
            </Button>
          </div>
          <div className="flow-task-list">
            {visibleTasks.slice(0, 4).map((task) => (
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
                    {task.priority === "high" ? tr("Cao") : tr("Vừa")}
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
            {!visibleTasks.length && (
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
        </section>
        <DistractionTray />
      </div>
      <div className="desk-signoff">
        <PencilLine size={17} />
        <span>
          {copy(
            "Mỗi phiên để lại một bước tiếp theo.",
            "Leave one next step at the end of each session.",
          )}
        </span>
        <Link to="/insights">
          {copy("Mở tổng kết tuần", "Open weekly reflection")}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      {adding && <TaskForm task={null} onClose={() => setAdding(false)} />}
      {editing && (
        <TaskForm
          task={tasks.find((task) => task.id === editing) ?? null}
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
