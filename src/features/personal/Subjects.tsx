import { useState } from "react";
import { Plus, Pencil, BookOpen } from "lucide-react";
import { Button, Modal } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import { emptyPersonal } from "./domain/personal-study";
import { useCopy } from "./copy";
import type { StudySubject } from "../../types";
export default function Subjects() {
  const copy = useCopy();
  const personal = useApp((state) => state.personal ?? emptyPersonal);
  const status = useApp((state) => state.timer.status);
  const [editing, setEditing] = useState<StudySubject | null | undefined>(
    undefined,
  );
  const locked = status === "RUNNING" || status === "PAUSED";
  return (
    <div className="subject-shelf">
      <div
        className="subject-tabs"
        role="group"
        aria-label={copy("Không gian theo môn", "Subject spaces")}
      >
        <button
          type="button"
          aria-pressed={personal.activeSubjectId === null}
          disabled={locked}
          onClick={() => useApp.getState().chooseSubject(null)}
        >
          <BookOpen size={16} />
          {copy("Góc học chung", "General study")}
        </button>
        {personal.subjects.map((subject) => (
          <button
            type="button"
            key={subject.id}
            disabled={locked}
            aria-pressed={personal.activeSubjectId === subject.id}
            onClick={() => useApp.getState().chooseSubject(subject.id)}
          >
            {subject.name}
          </button>
        ))}
      </div>
      <div className="subject-tools">
        <button type="button" onClick={() => setEditing(null)}>
          <Plus size={16} />
          {copy("Thêm môn", "Add subject")}
        </button>
        {personal.activeSubjectId && (
          <button
            type="button"
            aria-label={copy("Sửa môn học", "Edit subject")}
            onClick={() =>
              setEditing(
                personal.subjects.find(
                  (subject) => subject.id === personal.activeSubjectId,
                ),
              )
            }
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
      {locked && (
        <small>
          {copy(
            "Đang trong phiên. Kết thúc hoặc đặt lại phiên để đổi môn.",
            "Finish or reset this session before switching subjects.",
          )}
        </small>
      )}
      {editing !== undefined && (
        <SubjectForm subject={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
function SubjectForm({
  subject,
  onClose,
}: {
  subject: StudySubject | null;
  onClose: () => void;
}) {
  const copy = useCopy();
  const [draft, setDraft] = useState<StudySubject>(
    subject ?? {
      id: crypto.randomUUID(),
      name: "",
      notes: "",
      scene: "library",
      createdAt: Date.now(),
    },
  );
  const [error, setError] = useState("");
  return (
    <Modal
      title={copy(
        subject ? "Sửa môn học" : "Môn học mới",
        subject ? "Edit subject" : "New subject",
      )}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          try {
            useApp.getState().putSubject({ ...draft, name: draft.name.trim() });
            if (!subject) useApp.getState().chooseSubject(draft.id);
            onClose();
          } catch (failure) {
            setError(
              failure instanceof Error
                ? failure.message
                : copy("Không thể lưu.", "Could not save."),
            );
          }
        }}
      >
        <label className="field">
          {copy("Tên môn học", "Subject name")}
          <input
            className="input"
            autoFocus
            required
            maxLength={60}
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            placeholder={copy(
              "Ví dụ: Tiếng Anh, Lập trình…",
              "For example: English, Programming…",
            )}
          />
        </label>
        <label className="field personal-field">
          {copy("Ghi chú của môn", "Subject notes")}
          <textarea
            className="input"
            rows={4}
            maxLength={4000}
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder={copy(
              "Tài liệu đang học, mục tiêu hoặc điều cần nhớ…",
              "Resources, goals or things to remember…",
            )}
          />
        </label>
        <label className="field personal-field">
          {copy("Ảnh ở chế độ Bàn học", "Image in Desk view")}
          <select
            className="input"
            value={draft.scene}
            onChange={(event) =>
              setDraft({
                ...draft,
                scene: event.target.value as StudySubject["scene"],
              })
            }
          >
            {[
              ["study", "Góc học", "Study nook"],
              ["library", "Thư viện", "Library"],
              ["cafe", "Quán cà phê", "Café"],
              ["forest", "Rừng mưa", "Rainforest"],
            ].map(([value, vi, en]) => (
              <option key={value} value={value}>
                {copy(vi, en)}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button type="button" onClick={onClose}>
            {copy("Hủy", "Cancel")}
          </Button>
          <Button primary type="submit">
            {copy("Lưu môn học", "Save subject")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
