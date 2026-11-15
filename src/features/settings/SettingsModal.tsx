import { tr, useI18n } from "../../i18n";
import { useEffect, useState, type FormEvent } from "react";
import {
  Timer,
  Repeat2,
  Palette,
  Target,
  Bell,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { Button, Modal } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import { defaults, type UserSettings } from "../../types";
import { validSettings } from "../../services/storage";
import DataSettings from "./DataSettings";
import { rooms } from "../focus/RoomScenes";
import { applyAppearance } from "./appearance";

type NumericSetting =
  | "focusDuration"
  | "shortBreakDuration"
  | "longBreakDuration"
  | "longBreakInterval"
  | "dailyFocusGoal"
  | "dailySessionGoal";
type ToggleSetting =
  | "autoStartBreaks"
  | "autoStartFocus"
  | "companionEnabled"
  | "soundEnabled"
  | "notificationEnabled";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { language } = useI18n();
  const palettes = [
    {
      value: "lavender",
      label: tr("Hoa oải hương"),
      description: tr("Nhẹ nhàng, quen thuộc"),
    },
    {
      value: "midnight",
      label: tr("Đêm xanh"),
      description: tr("Yên tĩnh, sâu lắng"),
    },
    {
      value: "forest",
      label: tr("Rừng yên tĩnh"),
      description: tr("Dịu mắt, gần thiên nhiên"),
    },
  ] as const;
  const themes = [
    { value: "light", label: tr("Sáng"), icon: Sun },
    { value: "dark", label: tr("Tối"), icon: Moon },
    { value: "system", label: tr("Theo hệ thống"), icon: Monitor },
  ] as const;
  const rhythms = [
    { label: tr("Cân bằng"), focus: 25, short: 5, long: 15 },
    { label: tr("Học sâu"), focus: 50, short: 10, long: 20 },
    { label: tr("Khởi động nhẹ"), focus: 15, short: 3, long: 10 },
  ];

  const saved = useApp((state) => state.settings);
  const [draft, setDraft] = useState<UserSettings>({
    ...defaults,
    ...saved,
    palette: saved.palette ?? "lavender",
    companionEnabled: saved.companionEnabled !== false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [soundMessage, setSoundMessage] = useState("");
  const automatic = draft.autoStartBreaks && draft.autoStartFocus;
  const changed = Object.keys(defaults).some((key) => {
    const setting = key as keyof UserSettings;
    return draft[setting] !== (saved[setting] ?? defaults[setting]);
  });
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const preview = () => applyAppearance(draft);
    preview();
    media.addEventListener("change", preview);
    return () => media.removeEventListener("change", preview);
  }, [draft.theme, draft.palette]);
  useEffect(() => () => applyAppearance(useApp.getState().settings), []);

  const number = (
    key: NumericSetting,
    label: string,
    unit: string,
    max: number,
  ) => (
    <label className="settings-number" key={key}>
      <span>{label}</span>
      <span className="settings-number-control">
        <input
          type="number"
          aria-label={label}
          inputMode="numeric"
          required
          min={1}
          max={max}
          step={1}
          value={draft[key] || ""}
          onChange={(event) =>
            setDraft({ ...draft, [key]: Number(event.target.value) })
          }
        />
        <span aria-hidden="true">{unit}</span>
      </span>
    </label>
  );
  const toggle = (key: ToggleSetting, label: string, description: string) => (
    <label className="settings-toggle" key={key}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        aria-label={label}
        checked={Boolean(draft[key])}
        onChange={(event) =>
          setDraft({ ...draft, [key]: event.target.checked })
        }
      />
    </label>
  );
  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (!validSettings(draft)) {
      setError(
        tr(
          "Kiểm tra lại các giá trị: thời lượng từ 1–180 phút, nghỉ dài sau 1–12 phiên.",
        ),
      );
      return;
    }
    setSaving(true);
    try {
      if (draft.notificationEnabled) {
        if (!("Notification" in window))
          throw new Error(
            tr(
              "Trình duyệt này chưa hỗ trợ thông báo. Hãy tắt thông báo trình duyệt để lưu các lựa chọn còn lại.",
            ),
          );
        const permission =
          Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();
        if (permission !== "granted")
          throw new Error(
            tr(
              "Chưa được cấp quyền thông báo. Bạn có thể cấp quyền trong trình duyệt, hoặc tắt mục này rồi lưu lại.",
            ),
          );
      }
      useApp.getState().settingsSave(draft);
      useApp.getState().notify(tr("Đã lưu cài đặt phòng học.", draft.language));
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : tr("Không thể lưu cài đặt."),
      );
    } finally {
      setSaving(false);
    }
  };
  const previewSound = async () => {
    setSoundMessage("");
    try {
      await new Audio(
        new URL("../../../assets/chime.wav", import.meta.url).href,
      ).play();
      setSoundMessage(tr("Đang phát âm thanh kết thúc phiên."));
    } catch {
      setSoundMessage(
        tr(
          "Chưa phát được âm thanh. Hãy kiểm tra âm lượng và quyền phát âm thanh của trình duyệt.",
        ),
      );
    }
  };
  return (
    <Modal
      title={tr("Cài đặt phòng học")}
      className="settings-dialog"
      onClose={onClose}
      closeDisabled={saving}
    >
      <form className="settings-form" onSubmit={saveSettings}>
        <div className="settings-scroll">
          <p className="settings-intro">
            {tr(
              "Thiết lập một nhịp học vừa sức với bạn. Mọi thay đổi được lưu khi bạn nhấn",
            )}{" "}
            <strong>{tr("Lưu cài đặt")}</strong>.
          </p>
          <section className="settings-block" aria-labelledby="rhythm-heading">
            <div className="settings-block-heading">
              <Timer size={22} />
              <div>
                <h3 id="rhythm-heading">{tr("Nhịp học của bạn")}</h3>
                <p>{tr("Chọn một nhịp mẫu hoặc tự điều chỉnh thời lượng.")}</p>
              </div>
            </div>
            <div className="rhythm-options" aria-label={tr("Nhịp học mẫu")}>
              {rhythms.map((rhythm) => (
                <button
                  type="button"
                  key={rhythm.label}
                  aria-pressed={
                    draft.focusDuration === rhythm.focus &&
                    draft.shortBreakDuration === rhythm.short &&
                    draft.longBreakDuration === rhythm.long
                  }
                  onClick={() =>
                    setDraft({
                      ...draft,
                      focusDuration: rhythm.focus,
                      shortBreakDuration: rhythm.short,
                      longBreakDuration: rhythm.long,
                    })
                  }
                >
                  <strong>{rhythm.label}</strong>
                  <span>
                    {rhythm.focus} {tr("phút học ·")} {rhythm.short}{" "}
                    {tr("phút nghỉ")}
                  </span>
                </button>
              ))}
            </div>
            <div className="settings-number-grid">
              {number("focusDuration", tr("Tập trung (phút)"), tr("phút"), 180)}
              {number(
                "shortBreakDuration",
                tr("Nghỉ ngắn (phút)"),
                tr("phút"),
                180,
              )}
              {number(
                "longBreakDuration",
                tr("Nghỉ dài (phút)"),
                tr("phút"),
                180,
              )}
              {number(
                "longBreakInterval",
                tr("Nghỉ dài sau số phiên"),
                tr("phiên"),
                12,
              )}
            </div>
            <p className="settings-note">
              {tr(
                "Phiên đang chạy giữ nguyên thời lượng. Giá trị mới áp dụng từ phiên tiếp theo.",
              )}
            </p>
            <div className="settings-cycle">
              <label className="settings-toggle cycle-toggle">
                <span>
                  <strong>
                    <Repeat2 size={18} /> {tr("Tự động lặp chu kỳ")}
                  </strong>
                  <small>
                    {tr(
                      "Hết giờ học sẽ vào giờ nghỉ; hết giờ nghỉ sẽ bắt đầu phiên học mới.",
                    )}
                  </small>
                </span>
                <input
                  type="checkbox"
                  aria-label={tr("Tự động lặp chu kỳ")}
                  checked={automatic}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      autoStartBreaks: event.target.checked,
                      autoStartFocus: event.target.checked,
                    })
                  }
                />
              </label>
              <div className="cycle-preview" aria-label={tr("Thứ tự chu kỳ")}>
                <span>
                  <strong>{tr("Tập trung")}</strong>
                  {draft.focusDuration || "—"} {tr("phút")}
                </span>
                <ArrowRight aria-hidden="true" size={18} />
                <span>
                  <strong>{tr("Nghỉ ngắn")}</strong>
                  {draft.shortBreakDuration || "—"} {tr("phút")}
                </span>
                <ArrowRight aria-hidden="true" size={18} />
                <span>
                  <strong>{tr("Lặp lại")}</strong>
                  {draft.longBreakInterval || "—"} {tr("phiên")}
                </span>
                <ArrowRight aria-hidden="true" size={18} />
                <span>
                  <strong>{tr("Nghỉ dài")}</strong>
                  {draft.longBreakDuration || "—"} {tr("phút")}
                </span>
              </div>
              <p className="settings-note">
                {tr("Sau mỗi")} {draft.longBreakInterval || "—"}{" "}
                {tr(
                  "phiên tập trung hoàn tất, nghỉ dài thay cho nghỉ ngắn. Bạn có thể tạm dừng bất cứ lúc nào.",
                )}
              </p>
              <details className="settings-advanced">
                <summary>{tr("Tùy chỉnh chuyển phiên")}</summary>
                {toggle(
                  "autoStartBreaks",
                  tr("Tự động bắt đầu nghỉ"),
                  tr("Chuyển sang giờ nghỉ ngay khi hoàn tất phiên tập trung."),
                )}
                {toggle(
                  "autoStartFocus",
                  tr("Tự động bắt đầu tập trung"),
                  tr("Tiếp tục học ngay khi giờ nghỉ kết thúc."),
                )}
              </details>
            </div>
          </section>
          <section
            className="settings-block"
            aria-labelledby="appearance-heading"
          >
            <div className="settings-block-heading">
              <Palette size={22} />
              <div>
                <h3 id="appearance-heading">{tr("Không gian học")}</h3>
                <p>{tr("Xem thử giao diện ngay trước khi lưu.")}</p>
              </div>
            </div>
            <label className="field language-choice">
              {tr("Ngôn ngữ")}
              <select
                className="input"
                aria-label={tr("Ngôn ngữ")}
                value={draft.language}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    language: event.target.value as UserSettings["language"],
                  })
                }
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </label>
            <fieldset className="settings-choices">
              <legend>{tr("Cảnh phòng học")}</legend>
              <div className="room-choices">
                {rooms.map((room) => (
                  <label key={room.id}>
                    <input
                      type="radio"
                      name="scene"
                      value={room.id}
                      checked={draft.scene === room.id}
                      onChange={() => setDraft({ ...draft, scene: room.id })}
                    />
                    {room.image ? (
                      <img src={room.image} alt="" loading="lazy" />
                    ) : (
                      <span className="room-default">🌸</span>
                    )}
                    <strong>{language === "vi" ? room.vi : room.en}</strong>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="settings-choices">
              <legend>{tr("Chế độ sáng tối")}</legend>
              <div className="theme-choices">
                {themes.map(({ value, label, icon: Icon }) => (
                  <label className="theme-choice" key={value}>
                    <input
                      type="radio"
                      name="theme"
                      value={value}
                      checked={draft.theme === value}
                      onChange={() => setDraft({ ...draft, theme: value })}
                    />
                    <span>
                      <Icon size={19} />
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="settings-choices">
              <legend>{tr("Bảng màu")}</legend>
              <div className="palette-choices">
                {palettes.map(({ value, label, description }) => (
                  <label
                    className="palette-choice"
                    key={value}
                    data-preview-palette={value}
                  >
                    <input
                      type="radio"
                      name="palette"
                      value={value}
                      checked={draft.palette === value}
                      onChange={() => setDraft({ ...draft, palette: value })}
                    />
                    <span className="palette-preview" aria-hidden="true">
                      <span className="preview-sidebar">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="preview-workspace">
                        <span className="preview-clock">25:00</span>
                        <span className="preview-button" />
                      </span>
                      <Check className="palette-check" size={16} />
                    </span>
                    <span className="palette-name">{label}</span>
                    <small>{description}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            {toggle(
              "companionEnabled",
              tr("Hiện mèo đồng hành"),
              tr("Một người bạn nhỏ bên góc học trên màn hình rộng."),
            )}
          </section>
          <div className="settings-bottom-grid">
            <section className="settings-block" aria-labelledby="goals-heading">
              <div className="settings-block-heading">
                <Target size={22} />
                <div>
                  <h3 id="goals-heading">{tr("Mục tiêu mỗi ngày")}</h3>
                  <p>{tr("Tiến bộ từng chút, theo sức của bạn.")}</p>
                </div>
              </div>
              <div className="settings-goals-grid">
                {number(
                  "dailyFocusGoal",
                  tr("Thời gian tập trung (phút)"),
                  tr("phút"),
                  1440,
                )}
                {number(
                  "dailySessionGoal",
                  tr("Số phiên tập trung"),
                  tr("phiên"),
                  100,
                )}
              </div>
            </section>
            <section
              className="settings-block"
              aria-labelledby="notifications-heading"
            >
              <div className="settings-block-heading">
                <Bell size={22} />
                <div>
                  <h3 id="notifications-heading">
                    {tr("Âm thanh & thông báo")}
                  </h3>
                  <p>{tr("Nhắc nhẹ khi đến lúc đổi nhịp.")}</p>
                </div>
              </div>
              {toggle(
                "soundEnabled",
                tr("Phát âm thanh khi hoàn tất phiên"),
                tr("Âm báo ngắn khi hết giờ học hoặc nghỉ."),
              )}
              <button
                className="settings-sound-test"
                type="button"
                onClick={() => void previewSound()}
              >
                <Volume2 size={16} />
                {tr("Nghe thử âm thanh")}
              </button>
              {soundMessage && (
                <p role="status" className="settings-note">
                  {soundMessage}
                </p>
              )}
              {toggle(
                "notificationEnabled",
                tr("Thông báo trình duyệt"),
                tr(
                  "Cần cấp quyền khi lưu. Đồng hồ luôn hiển thị trên tên tab.",
                ),
              )}
            </section>
          </div>
          <DataSettings onRestored={onClose} />
        </div>
        <div className="settings-footer">
          {error && (
            <p role="alert" className="settings-error">
              {error}
            </p>
          )}
          <div className="settings-footer-row">
            <button
              className="settings-reset"
              type="button"
              disabled={saving}
              onClick={() => {
                setDraft({ ...defaults });
                setError("");
              }}
            >
              <RotateCcw size={16} />
              <span>{tr("Về mặc định")}</span>
            </button>
            <span className="settings-save-state" role="status">
              {changed ? tr("Có thay đổi chưa lưu") : tr("Cài đặt đã lưu")}
            </span>
            <div className="settings-actions">
              <Button type="button" disabled={saving} onClick={onClose}>
                {tr("Hủy")}
              </Button>
              <Button type="submit" primary disabled={saving}>
                {saving ? tr("Đang lưu…") : tr("Lưu cài đặt")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
