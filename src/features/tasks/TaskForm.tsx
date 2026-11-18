import { displayTaskDate, parseTaskDate } from "./task-date";
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
  const { language } = useI18n();
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
  const [dateText, setDateText] = useState(
    displayTaskDate(task?.dueAt ?? null, language),
  );
  const [error, setError] = useState("");
  return (
    <Modal
      title={task ? tr("Sửa việc học") : tr("Thêm việc học")}
      onClose={onClose}
      className="task-dialog"
    >
      <form
        className="task-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.title.trim()) {
            setError(tr("Hãy nhập tên việc học."));
            return;
          }
          const dueAt = parseTaskDate(dateText, language);
          if (dueAt === undefined) {
            setError(
              copy(
                "Ngày chưa hợp lệ. Nhập theo ngày/tháng/năm, ví dụ 25/11/2026.",
                "Invalid date. Use month/day/year, for example 11/25/2026.",
              ),
            );
            return;
          }
          useApp.getState().putTask({
            ...draft,
            dueAt,
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
        <div className="task-form-scroll">
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
                <option value="">
                  {copy("Góc học chung", "General study")}
                </option>
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
                rows={2}
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
                type="text"
                inputMode="numeric"
                placeholder={language === "vi" ? "dd/mm/yyyy" : "mm/dd/yyyy"}
                value={dateText}
                onChange={(event) => setDateText(event.target.value)}
              />
            </label>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
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
