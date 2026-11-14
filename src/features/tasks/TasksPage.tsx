import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  PageTitle,
  ProgressBar,
} from "../../components/ui";
import { useApp } from "../../stores/app-store";
import type { StudyTask } from "../../types";
export default function TasksPage() {
  const tasks = useApp((s) => s.tasks);
  const [form, setForm] = useState<StudyTask | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("newest");
  const [deleting, setDeleting] = useState<StudyTask | null>(null);
  const [starting, setStarting] = useState<StudyTask | null>(null);
  const navigate = useNavigate();
  const start = (task: StudyTask) => {
    useApp.getState().selectTask(task.id);
    navigate("/");
  };
  const visible = tasks
    .filter(
      (t) =>
        `${t.title} ${t.description}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "all" || t.isCompleted === (filter === "completed")) &&
        (priority === "all" || t.priority === priority),
    )
    .sort((a, b) =>
      sort === "priority"
        ? { high: 0, medium: 1, low: 2 }[a.priority] -
          { high: 0, medium: 1, low: 2 }[b.priority]
        : sort === "due"
          ? (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999")
          : b.createdAt - a.createdAt,
    );
  return (
    <>
      <PageTitle
        title="Small steps. Real progress."
        subtitle={`${tasks.filter((t) => t.isCompleted).length} of ${tasks.length} tasks complete. Make your next step a meaningful one.`}
      >
        <Button primary onClick={() => setForm(null)}>
          <Plus /> Add task
        </Button>
      </PageTitle>
      <div className="toolbar">
        <input
          className="input search"
          aria-label="Search tasks"
          placeholder="Search your tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input"
          aria-label="Filter tasks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All tasks</option>
          <option value="active">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="input"
          aria-label="Filter priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          className="input"
          aria-label="Sort tasks"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="priority">Priority</option>
          <option value="due">Due date</option>
        </select>
      </div>
      <div className="task-list">
        {visible.map((task) => (
          <Card
            className={`task-card ${task.isCompleted ? "completed" : ""}`}
            key={task.id}
          >
            <label style={{ minWidth: 28, minHeight: 44 }}>
              <span className="sr-only">
                {task.isCompleted ? "Reopen" : "Complete"} {task.title}
              </span>
              <input
                type="checkbox"
                className="task-check"
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
            <div className="task-body">
              <h3>{task.title}</h3>
              {task.description && <p>{task.description}</p>}
              <div className="task-meta">
                <span className={`badge ${task.priority}`}>
                  {task.priority} priority
                </span>
                <span>
                  {task.completedPomodoros} / {task.estimatedPomodoros}{" "}
                  Pomodoros
                </span>
                {task.dueAt && <span>Due {task.dueAt}</span>}
              </div>
              <ProgressBar
                value={
                  (task.completedPomodoros / task.estimatedPomodoros) * 100
                }
                label={`${task.title} focus progress`}
              />
            </div>
            <div className="task-actions">
              {!task.isCompleted && (
                <Button
                  onClick={() => {
                    const status = useApp.getState().timer.status;
                    if (status === "RUNNING" || status === "PAUSED")
                      setStarting(task);
                    else start(task);
                  }}
                >
                  <Play /> Start focus
                </Button>
              )}
              <IconButton
                label={`Edit ${task.title}`}
                onClick={() => setForm(task)}
              >
                <Pencil />
              </IconButton>
              <IconButton
                label={`Delete ${task.title}`}
                onClick={() => setDeleting(task)}
              >
                <Trash2 />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>
      {!visible.length && (
        <Card>
          <EmptyState
            title={
              tasks.length
                ? "A little breathing room."
                : "Big things start with one small task."
            }
          >
            <p>
              {tasks.length
                ? "No tasks match these filters. Try another search."
                : "Plan your study session, choose a priority, and take it one Pomodoro at a time."}
            </p>
            <Button primary onClick={() => setForm(null)}>
              <Plus /> Add a task
            </Button>
          </EmptyState>
        </Card>
      )}
      {form !== undefined && (
        <TaskForm task={form} onClose={() => setForm(undefined)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete this task?"
          message={`“${deleting.title}” will be removed. Its completed focus sessions will stay in Insights.`}
          onClose={() => setDeleting(null)}
          onConfirm={() => useApp.getState().deleteTask(deleting.id)}
        />
      )}
      {starting && (
        <ConfirmDialog
          title="Switch your focus?"
          message="Your unfinished session will be discarded. The new task will wait for you to press Start."
          onClose={() => setStarting(null)}
          onConfirm={() => start(starting)}
        />
      )}
    </>
  );
}
