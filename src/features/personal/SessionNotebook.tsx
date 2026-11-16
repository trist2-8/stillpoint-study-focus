import { useState } from "react";
import { Bookmark, Check, CornerDownRight } from "lucide-react";
import { useApp } from "../../stores/app-store";
import { Button } from "../../components/ui";
import { locale } from "../../i18n";
import { emptyPersonal, sessionSubject } from "./domain/personal-study";
import { useCopy } from "./copy";
import type { SessionJournal, FocusSession } from "../../types";
export default function SessionNotebook() {
  const copy = useCopy();
  const state = useApp();
  const personal = state.personal ?? emptyPersonal;
  const sessions = state.sessions
    .filter(
      (session) =>
        session.type === "FOCUS" &&
        sessionSubject(session, state.tasks) === personal.activeSubjectId,
    )
    .sort((left, right) => right.completedAt - left.completedAt);
  const [chosen, setChosen] = useState<string | null>(null);
  const session = sessions.find((item) => item.id === chosen) ?? sessions[0];
  const subject = personal.subjects.find(
    (item) => item.id === personal.activeSubjectId,
  );
  return (
    <aside
      className="desk-notebook"
      aria-label={copy("Sổ ghi nhớ", "Study notebook")}
    >
      <div className="notebook-heading">
        <Bookmark size={20} />
        <div>
          <h2>
            {copy("Để lần sau bắt đầu dễ hơn.", "Leave a note for next time.")}
          </h2>
          <p>
            {copy(
              "Ba dòng ngắn, giữ lại mạch học.",
              "Three short notes to keep your place.",
            )}
          </p>
        </div>
      </div>
      {session ? (
        <>
          <label className="field notebook-session">
            {copy("Phiên học", "Study session")}
            <select
              className="input"
              value={session.id}
              onChange={(event) => setChosen(event.target.value)}
            >
              {sessions.slice(0, 60).map((item) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.completedAt).toLocaleString(locale(), {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {Math.round(item.actualDurationMs / 60000)}{" "}
                  {copy("phút", "min")}
                </option>
              ))}
            </select>
          </label>
          <JournalEditor key={session.id} session={session} />
        </>
      ) : (
        <div className="notebook-empty">
          <span className="notebook-rule" />
          <h3>
            {copy(
              "Chưa có trang nào được viết.",
              "Your first page is waiting.",
            )}
          </h3>
          <p>
            {copy(
              "Hoàn tất một phiên tập trung. Bạn sẽ có chỗ ghi điều đã làm, phần còn vướng và bước tiếp theo ngay tại đây.",
              "Complete a focus session, then record what you did, where you got stuck and what to do next.",
            )}
          </p>
          <span className="notebook-rule" />
        </div>
      )}
      {subject?.notes && (
        <details className="subject-notes">
          <summary>{copy("Ghi chú môn học", "Subject notes")}</summary>
          <p>{subject.notes}</p>
        </details>
      )}
    </aside>
  );
}
function JournalEditor({ session }: { session: FocusSession }) {
  const copy = useCopy();
  const journal = useApp((state) =>
    state.personal?.journals.find((item) => item.sessionId === session.id),
  );
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const draft: SessionJournal = journal ?? {
    sessionId: session.id,
    accomplished: "",
    blocked: "",
    nextStep: "",
    energy: "steady",
    updatedAt: Date.now(),
    savedAt: null,
  };
  const update = (patch: Partial<SessionJournal>) => {
    setError("");
    useApp.getState().saveJournal({
      ...draft,
      ...patch,
      updatedAt: Date.now(),
      savedAt: null,
    });
  };
  if (journal?.savedAt && !editing)
    return (
      <div className="journal-saved">
        <dl>
          {(
            [
              ["accomplished", "Đã làm được", "Accomplished"],
              ["blocked", "Còn vướng", "Still working on"],
              ["nextStep", "Bước tiếp theo", "Next step"],
            ] as const
          ).map(([key, vi, en]) =>
            journal[key] ? (
              <div key={key}>
                <dt>{copy(vi, en)}</dt>
                <dd>{journal[key]}</dd>
              </div>
            ) : null,
          )}
        </dl>
        <div className="journal-save">
          <small>
            <Check size={14} />
            {copy("Đã lưu trên máy", "Saved on this device")}
          </small>
          <Button type="button" onClick={() => setEditing(true)}>
            {copy("Chỉnh nhật ký", "Edit journal")}
          </Button>
        </div>
      </div>
    );
  return (
    <form
      className="journal-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.accomplished.trim() && !draft.nextStep.trim()) {
          setError(
            copy(
              "Ghi một điều đã làm hoặc bước tiếp theo trước khi lưu.",
              "Add an accomplishment or a next step before saving.",
            ),
          );
          return;
        }
        useApp.getState().saveJournal({
          ...draft,
          savedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }}
    >
      {(
        [
          [
            "accomplished",
            "Đã làm được gì?",
            "What did you finish?",
            "Ví dụ: Đọc xong phần 2 và làm bài 1–3.",
            "For example: Read section 2 and solved exercises 1–3.",
          ],
          [
            "blocked",
            "Đang vướng ở đâu?",
            "Where did you get stuck?",
            "Một câu hỏi cần quay lại…",
            "A question to come back to…",
          ],
          [
            "nextStep",
            "Lần sau bắt đầu từ đâu?",
            "Where will you start next?",
            "Bước đầu tiên thật cụ thể…",
            "One concrete next step…",
          ],
        ] as const
      ).map(([key, vi, en, placeholderVi, placeholderEn]) => (
        <label className="field" key={key}>
          {copy(vi, en)}
          <textarea
            aria-label={copy(vi, en)}
            rows={2}
            maxLength={2000}
            value={draft[key]}
            onChange={(event) => update({ [key]: event.target.value })}
            placeholder={copy(placeholderVi, placeholderEn)}
          />
        </label>
      ))}
      <label className="field">
        {copy("Nhịp học vừa rồi", "How did it feel?")}
        <select
          className="input"
          aria-label={copy("Nhịp học vừa rồi", "How did it feel?")}
          value={draft.energy}
          onChange={(event) =>
            update({ energy: event.target.value as SessionJournal["energy"] })
          }
        >
          <option value="fresh">{copy("Còn tỉnh táo", "Still fresh")}</option>
          <option value="steady">{copy("Vừa sức", "Comfortable")}</option>
          <option value="tired">{copy("Khá mệt", "Quite tired")}</option>
        </select>
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="journal-save">
        <small role="status">
          {journal?.savedAt ? (
            <>
              <Check size={14} />
              {copy("Đã lưu nhật ký", "Journal saved")}
            </>
          ) : journal ? (
            copy("Bản nháp đã lưu trên máy", "Draft saved on this device")
          ) : (
            copy("Chỉ lưu trên thiết bị của bạn", "Stored on your device")
          )}
        </small>
        <Button primary type="submit">
          {copy("Lưu nhật ký", "Save journal")}
        </Button>
      </div>
    </form>
  );
}
export function NextStepNote({ taskId }: { taskId?: string }) {
  const copy = useCopy();
  const state = useApp();
  const personal = state.personal ?? emptyPersonal;
  const activeTaskId = taskId ?? state.timer.currentTaskId;
  const ids = new Set(
    state.sessions
      .filter(
        (session) =>
          session.type === "FOCUS" &&
          sessionSubject(session, state.tasks) === personal.activeSubjectId &&
          (activeTaskId ? session.taskId === activeTaskId : true),
      )
      .map((session) => session.id),
  );
  const last = personal.journals
    .filter(
      (journal) =>
        journal.savedAt !== null &&
        journal.nextStep.trim() &&
        ids.has(journal.sessionId),
    )
    .sort((left, right) => (right.savedAt ?? 0) - (left.savedAt ?? 0))[0];
  return last ? (
    <div className="next-step-note">
      <CornerDownRight size={18} />
      <div>
        <small>
          {copy("Bạn đã để lại cho mình", "A note from your last session")}
        </small>
        <p>{last.nextStep}</p>
      </div>
    </div>
  ) : null;
}
