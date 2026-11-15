import { trf, tr, useI18n } from "../../i18n";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock3, CircleCheck, Timer, ListTodo, Flame } from "lucide-react";
import { Card, PageTitle } from "../../components/ui";
import { useApp } from "../../stores/app-store";
import ActivityHeatmap from "./ActivityHeatmap";
import {
  aggregate,
  formatMinutes,
  streak,
} from "./domain/analytics-calculations";
const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text-primary)",
  fontSize: 12,
};
export default function InsightsPage() {
  const { language } = useI18n();
  const sessions = useApp((s) => s.sessions);
  const tasks = useApp((s) => s.tasks);
  const [range, setRange] = useState(7);
  const data = useMemo(
    () => aggregate(sessions, range),
    [sessions, range, language],
  );
  const week = useMemo(() => aggregate(sessions, 7), [sessions, language]);
  const count = data.reduce((n, d) => n + d.sessions, 0);
  const minutes = data.reduce((n, d) => n + d.minutes, 0);
  const distribution = useMemo(() => {
    const dates = new Set(data.map((d) => d.date));
    const groups = new Map<string, number>();
    for (const s of sessions) {
      if (
        s.type !== "FOCUS" ||
        s.status !== "COMPLETED" ||
        !dates.has(s.dateKey)
      )
        continue;
      const label =
        tasks.find((t) => t.id === s.taskId)?.title ??
        (s.taskId ? tr("Việc đã lưu") : tr("Tập trung tự do"));
      groups.set(label, (groups.get(label) ?? 0) + 1);
    }
    return Array.from(groups, ([name, value]) => ({ name, value }));
  }, [sessions, tasks, data, language]);
  const colors = [
    "var(--primary)",
    "var(--accent)",
    "var(--success)",
    "var(--warning)",
  ];
  const empty = (
    <div className="chart-empty">
      <p>{tr("Nhịp học của bạn sẽ dần hiện ra ở đây.")}</p>
      <small>{tr("Hoàn thành một phiên để xem tiến độ.")}</small>
    </div>
  );
  return (
    <>
      <PageTitle
        title={tr("Xem bạn đã đi xa đến đâu.")}
        subtitle={tr(
          "Những khoảnh khắc tập trung nhỏ sẽ tạo nên điều có ý nghĩa.",
        )}
      >
        <select
          className="input"
          style={{ width: 130 }}
          aria-label={tr("Khoảng thời gian tiến độ")}
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        >
          <option value={7}>{tr("7 ngày qua")}</option>
          <option value={30}>{tr("30 ngày qua")}</option>
          <option value={90}>{tr("90 ngày qua")}</option>
        </select>
      </PageTitle>
      <div className="stats-grid">
        {[
          {
            icon: Clock3,
            value: formatMinutes(minutes),
            label: tr("Tổng thời gian tập trung"),
          },
          {
            icon: CircleCheck,
            value: count,
            label: tr("Pomodoro đã hoàn tất"),
          },
          {
            icon: Timer,
            value: formatMinutes(count ? minutes / count : 0),
            label: tr("Phiên trung bình"),
          },
          {
            icon: ListTodo,
            value: `${tasks.length ? Math.round((tasks.filter((t) => t.isCompleted).length / tasks.length) * 100) : 0}%`,
            label: tr("Tỷ lệ hoàn thành việc học"),
          },
          {
            icon: Flame,
            value: trf("{0} ngày", [streak(sessions)]),
            label: tr("Chuỗi ngày học hiện tại"),
          },
        ].map(({ icon: Icon, value, label }) => (
          <Card className="stat-card" key={label}>
            <div className="stat-icon">
              <Icon size={20} />
            </div>
            <strong>{value}</strong>
            <small>{label}</small>
          </Card>
        ))}
      </div>
      <div className="chart-grid">
        <Card>
          <h2>{tr("Thời gian tập trung theo tuần")}</h2>
          <small>{tr("Bảy ngày qua, từng phiên một.")}</small>
          <div
            aria-label={tr("Biểu đồ thời gian tập trung bảy ngày qua")}
            role="img"
          >
            {week.some((d) => d.minutes) ? (
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={week} margin={{ left: -24, right: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      name={tr("Phút tập trung")}
                      dataKey="minutes"
                      fill="var(--primary)"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={32}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              empty
            )}
          </div>
        </Card>
        <Card>
          <h2>{tr("Xu hướng tập trung")}</h2>
          <small>
            {tr("Phút tập trung mỗi ngày ·")}
            {range} {tr("ngày")}
          </small>
          <div
            aria-label={
              language === "en"
                ? "Daily focus minutes trend"
                : "Xu hướng số phút tập trung mỗi ngày"
            }
            role="img"
          >
            {count ? (
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ left: -24, right: 12 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="label"
                      minTickGap={32}
                      tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      name={tr("Phút tập trung")}
                      dataKey="minutes"
                      type="monotone"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              empty
            )}
          </div>
        </Card>
        <Card>
          <h2>{tr("Sự tập trung của bạn đi đâu")}</h2>
          <small>{tr("Phiên tập trung hoàn tất theo việc")}</small>
          {count ? (
            <>
              <div
                className="chart"
                role="img"
                aria-label={tr("Phân bố phiên học theo việc")}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="60%"
                      outerRadius="85%"
                      paddingAngle={3}
                      isAnimationActive={false}
                    >
                      {distribution.map((d, i) => (
                        <Cell
                          key={d.name}
                          fill={colors[i % colors.length]}
                          stroke="var(--surface)"
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul
                style={{
                  paddingLeft: 20,
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {distribution.map((d) => (
                  <li key={d.name} style={{ overflowWrap: "anywhere" }}>
                    {d.name}: {d.value}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            empty
          )}
        </Card>
        <Card>
          <h2>{tr("Lịch học của bạn")}</h2>
          <small>
            {range} {tr("ngày qua ·")}
            {data[0].label} — {data[data.length - 1].label}
          </small>
          <ActivityHeatmap days={data} />
          <p className="muted" style={{ fontSize: 12, marginTop: 24 }}>
            {tr(
              "Tiến bộ không cần một chuỗi ngày hoàn hảo. Điều quan trọng là bạn quay lại.",
            )}
          </p>
        </Card>
      </div>
      <details
        style={{ marginTop: 24, fontSize: 12, color: "var(--text-muted)" }}
      >
        <summary>{tr("Xem tổng từng ngày và cách tính")}</summary>
        <p>
          {tr(
            "Chỉ phiên tập trung đã hoàn tất mới được tính. Mỗi phiên thuộc về ngày hoàn tất theo giờ địa phương. Việc học tính trên toàn bộ danh sách hiện tại. Chuỗi ngày gồm hôm nay hoặc kết thúc từ hôm qua.",
          )}
        </p>
        <table style={{ width: "100%", marginTop: 12 }}>
          <thead>
            <tr>
              <th>{tr("Ngày")}</th>
              <th>{tr("Phút tập trung")}</th>
              <th>{tr("Số phiên")}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.minutes}</td>
                <td>{d.sessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
