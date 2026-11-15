import { trf, tr, useI18n } from "../../i18n";
import { useState } from "react";
import { formatMinutes } from "./domain/analytics-calculations";

type ActivityDay = {
  date: string;
  label: string;
  minutes: number;
  sessions: number;
};

export default function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const active = days.find((day) => day.date === selected);
  const total = days.reduce((sum, day) => sum + day.sessions, 0);
  const describe = (day: ActivityDay) =>
    trf("{0}: {1} phiên hoàn tất, {2}", [
      day.label,
      day.sessions,
      formatMinutes(day.minutes),
    ]);
  return (
    <div className="activity-map">
      <p className="activity-description">
        {tr(
          "Mỗi ô là một ngày. Màu đậm hơn khi bạn hoàn thành nhiều phiên học hơn.",
        )}
      </p>
      <div
        className="activity-grid"
        role="group"
        aria-label={trf("Hoạt động học tập trong {0} ngày qua", [days.length])}
      >
        {days.map((day) => (
          <button
            type="button"
            key={day.date}
            data-level={Math.min(4, day.sessions)}
            aria-label={describe(day)}
            aria-pressed={selected === day.date}
            title={describe(day)}
            onClick={() => setSelected(day.date)}
            onFocus={() => setSelected(day.date)}
          />
        ))}
      </div>
      <div className="activity-legend">
        <span>{tr("Chưa học")}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i aria-hidden="true" key={level} data-level={level} />
        ))}
        <span>{tr("4+ phiên")}</span>
      </div>
      <p className="activity-detail" aria-live="polite">
        {active
          ? describe(active)
          : total
            ? trf("{0} phiên hoàn tất · Chọn một ngày để xem chi tiết.", [
                total,
              ])
            : tr(
                "Chưa có phiên hoàn tất. Học xong một phiên Pomodoro để tô ô đầu tiên.",
              )}
      </p>
    </div>
  );
}
