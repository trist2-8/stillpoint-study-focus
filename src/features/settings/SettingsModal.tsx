import { useState } from "react";
import { Button, Modal } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import type { UserSettings } from "../../types";
export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const saved = useApp((s) => s.settings);
  const [draft, setDraft] = useState({
    ...saved,
    companionEnabled: saved.companionEnabled !== false,
  });
  const [error, setError] = useState("");
  const number = (key: keyof UserSettings, label: string, max: number) => (
    <label className="field" key={key}>
      {label}
      <input
        className="input"
        type="number"
        required
        min={1}
        max={max}
        step={1}
        value={draft[key] as number}
        onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
      />
    </label>
  );
  const toggle = (key: keyof UserSettings, label: string) => (
    <label className="switch-row" key={key}>
      {label}
      <input
        type="checkbox"
        checked={draft[key] as boolean}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
      />
    </label>
  );
  return (
    <Modal title="Make it your rhythm" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            let next = draft;
            if (draft.notificationEnabled) {
              if (!("Notification" in window)) {
                setError("Browser notifications are unavailable here.");
                next = { ...draft, notificationEnabled: false };
              } else if (
                (await Notification.requestPermission()) !== "granted"
              ) {
                setError(
                  "Notification permission was not granted. In-app reminders remain available.",
                );
                next = { ...draft, notificationEnabled: false };
              }
            }
            useApp.getState().settingsSave(next);
            if (next.notificationEnabled === draft.notificationEnabled) {
              useApp.getState().notify("Your preferences are saved.");
              onClose();
            } else setDraft(next);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Could not save settings.",
            );
          }
        }}
      >
        <p className="muted">A few small adjustments for the way you work.</p>
        <div className="settings-section">
          <h3>Timer</h3>
          <div className="form-grid">
            {number("focusDuration", "Focus (minutes)", 180)}
            {number("shortBreakDuration", "Short break (minutes)", 180)}
            {number("longBreakDuration", "Long break (minutes)", 180)}
            {number("longBreakInterval", "Long break after sessions", 12)}
          </div>
          {toggle("autoStartBreaks", "Automatically start breaks")}
          {toggle("autoStartFocus", "Automatically start focus")}
          <small>Duration changes apply to the next session.</small>
        </div>
        <div className="settings-section">
          <h3>Appearance</h3>
          <label className="field">
            Theme
            <select
              aria-label="Theme"
              className="input"
              value={draft.theme}
              onChange={(e) => {
                const theme = e.target.value as UserSettings["theme"];
                setDraft({ ...draft, theme });
                useApp
                  .getState()
                  .settingsSave({ ...useApp.getState().settings, theme });
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
          {toggle("companionEnabled", "Show study companion")}
        </div>
        <div className="settings-section">
          <h3>Daily goals</h3>
          <div className="form-grid">
            {number("dailyFocusGoal", "Focus time (minutes)", 1440)}
            {number("dailySessionGoal", "Focus sessions", 100)}
          </div>
        </div>
        <div className="settings-section">
          <h3>Notifications</h3>
          {toggle("soundEnabled", "Play a gentle completion sound")}
          {toggle("notificationEnabled", "Browser notifications")}
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button onClick={onClose} type="button">
            Close
          </Button>
          <Button primary type="submit">
            Save preferences
          </Button>
        </div>
      </form>
    </Modal>
  );
}
