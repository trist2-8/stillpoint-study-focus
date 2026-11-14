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
    <Modal
      title={task ? "Edit your task" : "Make room for a new task"}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.title.trim()) {
            setError("Give your task a title.");
            return;
          }
          useApp.getState().putTask({
            ...draft,
            title: draft.title.trim(),
            updatedAt: Date.now(),
          });
          useApp
            .getState()
            .notify(task ? "Task updated." : "Your next step is ready.");
          onClose();
        }}
      >
        <div className="form-grid">
          <label className="field full">
            Task title
            <input
              autoFocus
              className="input"
              required
              maxLength={160}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="What would you like to work on?"
            />
          </label>
          <label className="field full">
            Description (optional)
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
            Priority
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
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field">
            Estimated Pomodoros
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
            Due date (optional)
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
            Cancel
          </Button>
          <Button primary type="submit">
            {task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
