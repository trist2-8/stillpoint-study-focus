import { locale, getLanguage } from "../../../i18n";
import type { FocusSession } from "../../../types";
export function dateKey(time: number | Date) {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function days(count: number, now = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - count + 1 + i);
    return {
      date: dateKey(d),
      label: d.toLocaleDateString(locale(), { month: "short", day: "numeric" }),
      minutes: 0,
      sessions: 0,
    };
  });
}
export function aggregate(
  sessions: FocusSession[],
  count: number,
  now = new Date(),
) {
  const result = days(count, now);
  const map = new Map(result.map((d) => [d.date, d]));
  for (const s of sessions) {
    if (s.status !== "COMPLETED" || s.type !== "FOCUS") continue;
    const day = map.get(s.dateKey);
    if (day) {
      day.minutes += s.actualDurationMs / 60000;
      day.sessions++;
    }
  }
  return result;
}
export function streak(sessions: FocusSession[], now = new Date()) {
  const dates = new Set(
    sessions
      .filter((s) => s.type === "FOCUS" && s.status === "COMPLETED")
      .map((s) => s.dateKey),
  );
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  if (!dates.has(dateKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dates.has(dateKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
export function formatMinutes(minutes: number) {
  const m = Math.round(minutes);
  if (getLanguage() === "en")
    return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`;
  return m >= 60 ? `${Math.floor(m / 60)} giờ ${m % 60} phút` : `${m} phút`;
}
