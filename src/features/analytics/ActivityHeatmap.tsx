import { useState } from "react";
import { formatMinutes } from "./domain/analytics-calculations";

type ActivityDay = {
  date: string;
  label: string;
  minutes: number;
  sessions: number;
};

export default function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = days.find((day) => day.date === selected);
  const total = days.reduce((sum, day) => sum + day.sessions, 0);
  const describe = (day: ActivityDay) =>
    `${day.label}: ${day.sessions} phiên hoàn tất, ${formatMinutes(day.minutes)}`;
  return (
    <div className="activity-map">
      <p className="activity-description">
        Mỗi ô là một ngày. Màu đậm hơn khi bạn hoàn thành nhiều phiên học hơn.
      </p>
      <div
        className="activity-grid"
        role="group"
        aria-label={`Hoạt động học tập trong ${days.length} ngày qua`}
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
        <span>Chưa học</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i aria-hidden="true" key={level} data-level={level} />
        ))}
        <span>4+ phiên</span>
      </div>
      <p className="activity-detail" aria-live="polite">
        {active
          ? describe(active)
          : total
            ? `${total} phiên hoàn tất · Chọn một ngày để xem chi tiết.`
            : "Chưa có phiên hoàn tất. Học xong một phiên Pomodoro để tô ô đầu tiên."}
      </p>
    </div>
  );
}
