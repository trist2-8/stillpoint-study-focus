import { tr } from "../../../i18n";
import type { TimerState } from "../../../types";
import { remaining } from "./timer-engine";

const labels = {
  FOCUS: "Tập trung",
  SHORT_BREAK: "Nghỉ ngắn",
  LONG_BREAK: "Nghỉ dài",
};
export function timerTabTitle(timer: TimerState, now: number) {
  if (timer.status === "IDLE") return tr("Focus Flow · Phòng học của bạn");
  if (timer.status === "COMPLETED")
    return tr("Hoàn tất") + " · " + tr(labels[timer.mode]) + " | Focus Flow";
  const seconds = Math.ceil(remaining(timer, { now: () => now }) / 1000);
  const time =
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");
  return (
    time +
    " · " +
    tr(timer.status === "PAUSED" ? "Tạm dừng" : labels[timer.mode]) +
    " | Focus Flow"
  );
}
