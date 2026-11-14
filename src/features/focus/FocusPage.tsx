import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ListTodo,
  ArrowRight,
  Plus,
  Leaf,
  Clock3,
  Flame,
  CircleCheck,
  Coffee,
  Cat,
} from "lucide-react";
import { useApp } from "../../stores/app-store";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  ProgressBar,
} from "../../components/ui";
import { remaining, nextMode } from "./domain/timer-engine";
import {
  aggregate,
  formatMinutes,
  streak,
} from "../analytics/domain/analytics-calculations";
import type { Mode } from "../../types";
import StudyRoom from "./illustrations/StudyRoom";
import GrowthPlant, { growthStage } from "./illustrations/GrowthPlant";
import { TaskForm } from "../tasks/TaskForm";
const names: Record<Mode, string> = {
  FOCUS: "Focus",
  SHORT_BREAK: "Short break",
  LONG_BREAK: "Long break",
};
export default function FocusPage() {
  const timer = useApp((s) => s.timer),
    settings = useApp((s) => s.settings),
    sessions = useApp((s) => s.sessions),
    tasks = useApp((s) => s.tasks);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState<null | (() => void)>(null);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    if (timer.status !== "RUNNING") return;
    const refresh = () => setNow(Date.now());
    refresh();
    const id = setInterval(refresh, 250);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [timer.status]);
  const ms = remaining(timer, { now: () => now }),
    seconds = Math.ceil(ms / 1000);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const today = aggregate(sessions, 1)[0],
    week = aggregate(sessions, 7);
  const total = sessions.filter(
    (s) => s.type === "FOCUS" && s.status === "COMPLETED",
  ).length;
  const task = tasks.find((t) => t.id === timer.currentTaskId),
    cycle = total % settings.longBreakInterval;
  const next = nextMode(timer.mode, total, settings.longBreakInterval);
  const request = (fn: () => void) => {
    if (timer.status === "RUNNING" || timer.status === "PAUSED")
      setConfirm(() => fn);
    else fn();
  };
  const companion = settings.companionEnabled !== false;
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const stage = growthStage(total);
  return (
    <div className="living-focus">
      <div className="room-heading">
        <div>
          <p className="eyebrow">YOUR LITTLE CORNER OF CALM</p>
          <h1>
            A little focus.
            <br className="mobile-title-break" /> A little <em>growth.</em>
          </h1>
          <p>Leave the noise outside. There’s room for you here.</p>
        </div>
        <span className="world-label">
          <span className="world-light">Lavender morning</span>
          <span className="world-dark">Moonlit lavender</span>
          <i className="dot" />
        </span>
      </div>
      <div className="living-layout">
        <section
          className="living-room"
          aria-label="Living study room"
          data-status={timer.status}
          data-mode={timer.mode}
        >
          <div className="room-topline">
            <span>
              <i className="dot" /> THE LIVING STUDY ROOM
            </span>
            <button
              className="companion-toggle"
              aria-label={
                companion ? "Hide study companion" : "Show study companion"
              }
              aria-pressed={companion}
              title={
                companion ? "Hide study companion" : "Show study companion"
              }
              onClick={() =>
                useApp
                  .getState()
                  .settingsSave({ ...settings, companionEnabled: !companion })
              }
            >
              <Cat size={17} />
              <span>Companion {companion ? "on" : "off"}</span>
            </button>
          </div>
          <div className="room-scene">
            <StudyRoom
              status={timer.status}
              mode={timer.mode}
              companion={companion}
            />
            <div className="orb-workspace">
              <div className="mode-selector" aria-label="Session mode">
                {(Object.keys(names) as Mode[]).map((mode) => (
                  <button
                    key={mode}
                    aria-pressed={timer.mode === mode}
                    onClick={() => {
                      if (mode !== timer.mode)
                        request(() => useApp.getState().setMode(mode));
                    }}
                  >
                    {names[mode]}
                  </button>
                ))}
              </div>
              <div
                className="timer-circle focus-orb"
                data-mode={timer.mode}
                data-status={timer.status}
              >
                <div className="orb-halo" />
                <svg viewBox="0 0 340 340" aria-hidden="true">
                  <circle
                    className="timer-track"
                    cx="170"
                    cy="170"
                    r="154"
                    fill="none"
                    strokeWidth="1.5"
                  />
                  <circle
                    className="timer-progress"
                    cx="170"
                    cy="170"
                    r="154"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 154}
                    strokeDashoffset={
                      2 * Math.PI * 154 * (1 - ms / timer.durationMs)
                    }
                  />
                  <circle
                    className="orb-particle"
                    cx={
                      170 +
                      154 * Math.cos((2 * Math.PI * ms) / timer.durationMs)
                    }
                    cy={
                      170 +
                      154 * Math.sin((2 * Math.PI * ms) / timer.durationMs)
                    }
                    r="4"
                  />
                </svg>
                <div className="timer-inner">
                  <Leaf size={20} />
                  <div className="timer-caption">
                    {timer.status === "COMPLETED"
                      ? "A moment well spent"
                      : timer.mode === "FOCUS"
                        ? "Let the world wait"
                        : "Breathe. Just be."}
                  </div>
                  <div
                    className="timer-digits"
                    role="timer"
                    aria-label={`${names[timer.mode]} time remaining`}
                  >
                    {display}
                  </div>
                  <small>
                    {timer.status === "RUNNING"
                      ? "One thing. One quiet moment."
                      : timer.status === "PAUSED"
                        ? "Your little world can wait."
                        : timer.status === "COMPLETED"
                          ? "Look at you, growing."
                          : "Settle in. Begin when you’re ready."}
                  </small>
                </div>
              </div>
              <p className="sr-only" aria-live="polite">
                {names[timer.mode]} session {timer.status.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="room-controls">
            <div className="active-task">
              <ListTodo size={14} />
              <span>
                {task
                  ? task.title
                  : "An open moment. Choose a task, or simply begin."}
              </span>
            </div>
            <div className="timer-controls">
              <IconButton
                label="Reset timer"
                onClick={() =>
                  request(() => useApp.getState().timerAction("reset"))
                }
              >
                <RotateCcw />
              </IconButton>
              <Button
                primary
                onClick={() =>
                  useApp
                    .getState()
                    .timerAction(
                      timer.status === "COMPLETED"
                        ? "next"
                        : timer.status === "RUNNING"
                          ? "pause"
                          : "start",
                    )
                }
              >
                {timer.status === "RUNNING" ? (
                  <Pause />
                ) : timer.status === "COMPLETED" ? (
                  <Coffee />
                ) : (
                  <Play />
                )}
                {timer.status === "RUNNING"
                  ? "Pause"
                  : timer.status === "PAUSED"
                    ? "Resume"
                    : timer.status === "COMPLETED"
                      ? `Next: ${names[next]}`
                      : timer.mode === "FOCUS"
                        ? "Start focus"
                        : "Start break"}
              </Button>
              <IconButton
                label="Skip session"
                onClick={() =>
                  request(() => useApp.getState().timerAction("skip"))
                }
              >
                <SkipForward />
              </IconButton>
            </div>
            <div className="room-cycle">
              <div
                className="session-dots"
                aria-label={`${cycle} of ${settings.longBreakInterval} sessions toward a long break`}
              >
                {Array.from({ length: settings.longBreakInterval }, (_, i) => (
                  <i key={i} className={i < cycle ? "done" : ""} />
                ))}
              </div>
              <span>
                A longer exhale every {settings.longBreakInterval} sessions
              </span>
            </div>
          </div>
        </section>
        <aside className="room-tasks">
          <div className="room-tasks-heading">
            <div>
              <p className="eyebrow">ONE THING AT A TIME</p>
              <h2>Today’s intentions</h2>
            </div>
            <IconButton label="Add task" onClick={() => setAdding(true)}>
              <Plus />
            </IconButton>
          </div>
          <p className="intentions-summary">
            {activeTasks.length} waiting ·{" "}
            {tasks.filter((t) => t.isCompleted).length} complete
          </p>
          <div className="room-task-list">
            {activeTasks.slice(0, 4).map((t) => (
              <article
                className={`room-task ${task?.id === t.id ? "selected" : ""}`}
                key={t.id}
              >
                <label className="room-task-check">
                  <input
                    type="checkbox"
                    aria-label={`Complete ${t.title}`}
                    checked={t.isCompleted}
                    onChange={() =>
                      useApp.getState().putTask({
                        ...t,
                        isCompleted: true,
                        updatedAt: Date.now(),
                      })
                    }
                  />
                </label>
                <div>
                  <h3>{t.title}</h3>
                  <span className="task-session-count">
                    {t.completedPomodoros} / {t.estimatedPomodoros} sessions{" "}
                    <span
                      className={`priority-dot ${t.priority}`}
                      title={`${t.priority} priority`}
                    />
                  </span>
                  <button
                    className="text-button"
                    onClick={() =>
                      request(() => useApp.getState().selectTask(t.id))
                    }
                  >
                    <Play size={12} />
                    {task?.id === t.id
                      ? "Selected for focus"
                      : "Make this my focus"}
                  </button>
                </div>
              </article>
            ))}
            {!activeTasks.length && (
              <EmptyState title="A fresh page, just for you.">
                <p>Give your next quiet moment a little intention.</p>
                <Button onClick={() => setAdding(true)}>
                  <Plus /> Add an intention
                </Button>
              </EmptyState>
            )}
          </div>
          <Link to="/tasks" className="text-button all-intentions">
            All your tasks <ArrowRight size={14} />
          </Link>
          <div className="room-daily-goal">
            <div className="row">
              <Leaf size={17} />
              <h3>A gentle goal</h3>
            </div>
            <div className="daily-goal-value">
              <strong>{today.sessions}</strong>
              <span>/ {settings.dailySessionGoal} focus sessions</span>
            </div>
            <ProgressBar
              value={(today.sessions / settings.dailySessionGoal) * 100}
              label="Daily session goal"
            />
            <p>
              {today.sessions >= settings.dailySessionGoal
                ? "You made space for yourself. Well done."
                : "No rush. Every little moment counts."}
            </p>
          </div>
          <blockquote className="room-note">
            “Almost everything will work again if you unplug it for a few
            minutes, including you.”<cite>A LITTLE REMINDER TO BREATHE</cite>
          </blockquote>
        </aside>
      </div>
      <section
        className="living-progress"
        aria-label="Your real study progress"
      >
        <div className="plant-progress">
          <GrowthPlant completed={total} />
          <div>
            <p className="eyebrow">GROW AT YOUR OWN PACE</p>
            <h2>
              {
                [
                  "Every garden starts somewhere.",
                  "A small beginning.",
                  "Taking root, finding rhythm.",
                  "Quietly, you’re growing.",
                  "Look how far you’ve grown.",
                ][stage]
              }
            </h2>
            <p>
              {total === 0
                ? "Your first focus session plants the beginning."
                : `${total} completed focus sessions. A little more life, one moment at a time.`}
            </p>
          </div>
        </div>
        <div className="progress-facts">
          {[
            {
              icon: Clock3,
              value: formatMinutes(today.minutes),
              label: "Focused today",
            },
            {
              icon: CircleCheck,
              value: today.sessions,
              label: "Little steps today",
            },
            {
              icon: Flame,
              value: `${streak(sessions)} days`,
              label: "Coming back to yourself",
            },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon size={16} />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="week-rhythm">
          <div className="row">
            <span className="eyebrow">YOUR WEEK, GENTLY</span>
            <Link to="/insights" aria-label="View study insights">
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rhythm-bars">
            {week.map((d) => (
              <div
                key={d.date}
                title={`${d.label}: ${formatMinutes(d.minutes)}`}
              >
                <span
                  style={{
                    height: `${Math.max(3, (d.minutes / Math.max(1, ...week.map((day) => day.minutes))) * 44)}px`,
                  }}
                  data-empty={d.minutes === 0}
                />
                <small>
                  {new Date(`${d.date}T12:00:00`).toLocaleDateString("en", {
                    weekday: "narrow",
                  })}
                </small>
              </div>
            ))}
          </div>
        </div>
      </section>
      {adding && <TaskForm task={null} onClose={() => setAdding(false)} />}
      {confirm && (
        <ConfirmDialog
          title="Leave this session?"
          message="This unfinished session will be discarded and won’t count toward your progress."
          onClose={() => setConfirm(null)}
          onConfirm={confirm}
        />
      )}
    </div>
  );
}
