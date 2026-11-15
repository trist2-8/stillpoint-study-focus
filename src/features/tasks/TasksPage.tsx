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
        title="Việc học, từng bước một."
        subtitle={`${tasks.filter((t) => t.isCompleted).length} / ${tasks.length} việc đã hoàn thành. Chọn một việc để bắt đầu phiên học.`}
      >
        <Button primary onClick={() => setForm(null)}>
          <Plus /> Thêm việc
        </Button>
      </PageTitle>
      <div className="toolbar">
        <input
          className="input search"
          aria-label="Tìm việc học"
          placeholder="Tìm trong danh sách việc học…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input"
          aria-label="Lọc việc học"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả việc học</option>
          <option value="active">Đang thực hiện</option>
          <option value="completed">Đã hoàn thành</option>
        </select>
        <select
          className="input"
          aria-label="Lọc mức ưu tiên"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">Tất cả mức ưu tiên</option>
          <option value="high">Cao</option>
          <option value="medium">Vừa</option>
          <option value="low">Thấp</option>
        </select>
        <select
          className="input"
          aria-label="Sắp xếp việc học"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="priority">Mức ưu tiên</option>
          <option value="due">Hạn hoàn thành</option>
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
                {task.isCompleted ? "Mở lại" : "Hoàn thành"} {task.title}
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
                  Mức ưu tiên:{" "}
                  {{ high: "Cao", medium: "Vừa", low: "Thấp" }[task.priority]}
                </span>
                <span>
                  {task.completedPomodoros} / {task.estimatedPomodoros} phiên
                </span>
                {task.dueAt && <span>Hạn: {task.dueAt}</span>}
              </div>
              <ProgressBar
                value={
                  (task.completedPomodoros / task.estimatedPomodoros) * 100
                }
                label={`${task.title} · tiến độ tập trung`}
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
                  <Play /> Bắt đầu tập trung
                </Button>
              )}
              <IconButton
                label={`Sửa ${task.title}`}
                onClick={() => setForm(task)}
              >
                <Pencil />
              </IconButton>
              <IconButton
                label={`Xóa ${task.title}`}
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
                ? "Không có việc học phù hợp."
                : "Bắt đầu với một việc học."
            }
          >
            <p>
              {tasks.length
                ? "Thử từ khóa hoặc bộ lọc khác để tìm việc học."
                : "Thêm việc cần học, chọn mức ưu tiên và bắt đầu một phiên Pomodoro."}
            </p>
            <Button primary onClick={() => setForm(null)}>
              <Plus /> Thêm việc học
            </Button>
          </EmptyState>
        </Card>
      )}
      {form !== undefined && (
        <TaskForm task={form} onClose={() => setForm(undefined)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Xóa việc học này?"
          message={`“${deleting.title}” sẽ bị xóa. Các phiên đã hoàn tất vẫn được giữ trong Tiến độ.`}
          onClose={() => setDeleting(null)}
          onConfirm={() => useApp.getState().deleteTask(deleting.id)}
        />
      )}
      {starting && (
        <ConfirmDialog
          title="Đổi việc đang tập trung?"
          message="Phiên chưa hoàn tất sẽ không được ghi lại. Bạn cần bấm Bắt đầu để học việc mới."
          onClose={() => setStarting(null)}
          onConfirm={() => start(starting)}
        />
      )}
    </>
  );
}
