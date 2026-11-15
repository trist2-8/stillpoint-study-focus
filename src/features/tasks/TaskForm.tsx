import { useState } from "react";
import { Button, Modal } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import type { StudyTask } from "../../types";
export function TaskForm({
  task,
  onClose,
}: {
  task: StudyTask | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<StudyTask>(
    task ?? {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      priority: "medium",
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueAt: null,
    },
  );
  const [error, setError] = useState("");
  return (
    <Modal title={task ? "Sửa việc học" : "Thêm việc học"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.title.trim()) {
            setError("Hãy nhập tên việc học.");
            return;
          }
          useApp.getState().putTask({
            ...draft,
            title: draft.title.trim(),
            updatedAt: Date.now(),
          });
          useApp
            .getState()
            .notify(task ? "Đã cập nhật việc học." : "Đã thêm việc học.");
          onClose();
        }}
      >
        <div className="form-grid">
          <label className="field full">
            Tên việc học
            <input
              autoFocus
              className="input"
              required
              maxLength={160}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Bạn muốn học gì?"
            />
          </label>
          <label className="field full">
            Mô tả (không bắt buộc)
            <textarea
              className="input"
              rows={3}
              maxLength={2000}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </label>
          <label className="field">
            Mức ưu tiên
            <select
              className="input"
              value={draft.priority}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  priority: e.target.value as StudyTask["priority"],
                })
              }
            >
              <option value="low">Thấp</option>
              <option value="medium">Vừa</option>
              <option value="high">Cao</option>
            </select>
          </label>
          <label className="field">
            Số phiên dự kiến
            <input
              className="input"
              type="number"
              min={1}
              max={100}
              step={1}
              required
              value={draft.estimatedPomodoros}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  estimatedPomodoros: Number(e.target.value),
                })
              }
            />
          </label>
          <label className="field full">
            Hạn hoàn thành (không bắt buộc)
            <input
              className="input"
              type="date"
              value={draft.dueAt ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, dueAt: e.target.value || null })
              }
            />
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button primary type="submit">
            {task ? "Lưu thay đổi" : "Tạo việc học"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
