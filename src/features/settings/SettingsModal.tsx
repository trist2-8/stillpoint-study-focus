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
    <Modal title="Cài đặt phòng học" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            let next = draft;
            if (draft.notificationEnabled) {
              if (!("Notification" in window)) {
                setError("Trình duyệt này không hỗ trợ thông báo.");
                next = { ...draft, notificationEnabled: false };
              } else if (
                (await Notification.requestPermission()) !== "granted"
              ) {
                setError(
                  "Chưa được cấp quyền thông báo. Bạn vẫn nhận nhắc nhở trong ứng dụng.",
                );
                next = { ...draft, notificationEnabled: false };
              }
            }
            useApp.getState().settingsSave(next);
            if (next.notificationEnabled === draft.notificationEnabled) {
              useApp.getState().notify("Đã lưu cài đặt.");
              onClose();
            } else setDraft(next);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Không thể lưu cài đặt.",
            );
          }
        }}
      >
        <p className="muted">
          Điều chỉnh nhịp học và chọn giao diện phù hợp với bạn.
        </p>
        <div className="settings-section">
          <h3>Đồng hồ</h3>
          <div className="form-grid">
            {number("focusDuration", "Tập trung (phút)", 180)}
            {number("shortBreakDuration", "Nghỉ ngắn (phút)", 180)}
            {number("longBreakDuration", "Nghỉ dài (phút)", 180)}
            {number("longBreakInterval", "Nghỉ dài sau số phiên", 12)}
          </div>
          {toggle("autoStartBreaks", "Tự động bắt đầu nghỉ")}
          {toggle("autoStartFocus", "Tự động bắt đầu tập trung")}
          <small>Thời lượng mới áp dụng từ phiên tiếp theo.</small>
        </div>
        <div className="settings-section">
          <h3>Giao diện</h3>
          <label className="field">
            Chế độ sáng tối
            <select
              aria-label="Chế độ sáng tối"
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
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
              <option value="system">Theo hệ thống</option>
            </select>
          </label>
          <label className="field">
            Bảng màu
            <select
              className="input"
              aria-label="Bảng màu"
              value={draft.palette ?? "lavender"}
              onChange={(event) => {
                const palette = event.target.value as UserSettings["palette"];
                setDraft({ ...draft, palette });
                useApp
                  .getState()
                  .settingsSave({ ...useApp.getState().settings, palette });
              }}
            >
              <option value="lavender">Hoa oải hương</option>
              <option value="midnight">Đêm xanh</option>
              <option value="forest">Rừng yên tĩnh</option>
            </select>
          </label>
          {toggle("companionEnabled", "Hiện mèo đồng hành")}
        </div>
        <div className="settings-section">
          <h3>Mục tiêu mỗi ngày</h3>
          <div className="form-grid">
            {number("dailyFocusGoal", "Thời gian tập trung (phút)", 1440)}
            {number("dailySessionGoal", "Số phiên tập trung", 100)}
          </div>
        </div>
        <div className="settings-section">
          <h3>Thông báo</h3>
          {toggle("soundEnabled", "Phát âm thanh khi hoàn tất phiên")}
          {toggle("notificationEnabled", "Thông báo trình duyệt")}
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button onClick={onClose} type="button">
            Đóng
          </Button>
          <Button primary type="submit">
            Lưu cài đặt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
