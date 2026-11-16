import { useCopy } from "../personal/copy";
import { emptyPersonal } from "../personal/domain/personal-study";
import { tr, useI18n } from "../../i18n";
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
  useI18n();
  const copy = useCopy();
  const personal = useApp((state) => state.personal ?? emptyPersonal);
  const [draft, setDraft] = useState<StudyTask>(
    task ?? {
      id: crypto.randomUUID(),
      subjectId: personal.activeSubjectId,
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
    <Modal
      title={task ? tr("Sửa việc học") : tr("Thêm việc học")}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.title.trim()) {
            setError(tr("Hãy nhập tên việc học."));
            return;
          }
          useApp.getState().putTask({
            ...draft,
            title: draft.title.trim(),
            updatedAt: Date.now(),
          });
          useApp
            .getState()
            .notify(
              task ? tr("Đã cập nhật việc học.") : tr("Đã thêm việc học."),
            );
          onClose();
        }}
      >
        <div className="form-grid">
          <label className="field full">
            {tr("Tên việc học")}
            <input
              autoFocus
              className="input"
              required
              maxLength={160}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder={tr("Bạn muốn học gì?")}
            />
          </label>
          <label className="field full">
            {copy("Môn học", "Subject")}
            <select
              className="input"
              aria-label={copy("Môn học", "Subject")}
              value={draft.subjectId ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, subjectId: event.target.value || null })
              }
            >
              <option value="">{copy("Góc học chung", "General study")}</option>
              {personal.subjects.map((subject) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field full">
            {tr("Mô tả (không bắt buộc)")}
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
            {tr("Mức ưu tiên")}
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
              <option value="low">{tr("Thấp")}</option>
              <option value="medium">{tr("Vừa")}</option>
              <option value="high">{tr("Cao")}</option>
            </select>
          </label>
          <label className="field">
            {tr("Số phiên dự kiến")}
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
            {tr("Hạn hoàn thành (không bắt buộc)")}
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
            {tr("Hủy")}
          </Button>
          <Button primary type="submit">
            {task ? tr("Lưu thay đổi") : tr("Tạo việc học")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
