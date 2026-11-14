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
  const sessions = useApp((s) => s.sessions);
  const tasks = useApp((s) => s.tasks);
  const [range, setRange] = useState(7);
  const data = useMemo(() => aggregate(sessions, range), [sessions, range]);
  const week = useMemo(() => aggregate(sessions, 7), [sessions]);
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
        (s.taskId ? "Archived task" : "Open focus");
      groups.set(label, (groups.get(label) ?? 0) + 1);
    }
    return Array.from(groups, ([name, value]) => ({ name, value }));
  }, [sessions, tasks, data]);
  const colors = [
    "var(--primary)",
    "var(--accent)",
    "var(--success)",
    "var(--warning)",
  ];
  const empty = (
    <div className="chart-empty">
      <p>Your rhythm will take shape here.</p>
      <small>Complete a focus session to see your progress.</small>
    </div>
  );
  return (
    <>
      <PageTitle
        title="See how far you’ve come."
        subtitle="Small moments of focus add up to something meaningful."
      >
        <select
          className="input"
          style={{ width: 130 }}
          aria-label="Analytics date range"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </PageTitle>
      <div className="stats-grid">
        {[
          {
            icon: Clock3,
            value: formatMinutes(minutes),
            label: "Total focus time",
          },
          { icon: CircleCheck, value: count, label: "Completed Pomodoros" },
          {
            icon: Timer,
            value: formatMinutes(count ? minutes / count : 0),
            label: "Average session",
          },
          {
            icon: ListTodo,
            value: `${tasks.length ? Math.round((tasks.filter((t) => t.isCompleted).length / tasks.length) * 100) : 0}%`,
            label: "Task completion · all tasks",
          },
          {
            icon: Flame,
            value: `${streak(sessions)} days`,
            label: "Current study streak",
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
          <h2>Weekly focus time</h2>
          <small>Your last seven days, one session at a time.</small>
          <div aria-label="Weekly focus minutes bar chart" role="img">
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
                      name="Focus minutes"
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
          <h2>Focus trend</h2>
          <small>Daily focus minutes · last {range} days</small>
          <div aria-label="Daily focus minutes trend" role="img">
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
                      name="Focus minutes"
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
          <h2>Where your focus goes</h2>
          <small>Completed focus sessions by task</small>
          {count ? (
            <>
              <div
                className="chart"
                role="img"
                aria-label="Session distribution by task"
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
          <h2>A habit, taking root</h2>
          <small>Every square is a day. Every session counts.</small>
          <div
            className="heatmap"
            aria-label={`Study activity for the last ${range} days`}
          >
            {data.map((d) => (
              <span
                key={d.date}
                tabIndex={0}
                title={`${d.date}: ${formatMinutes(d.minutes)}, ${d.sessions} sessions`}
                aria-label={`${d.date}: ${formatMinutes(d.minutes)}, ${d.sessions} sessions`}
                data-level={
                  d.minutes === 0
                    ? 0
                    : d.minutes < 25
                      ? 1
                      : d.minutes < 60
                        ? 2
                        : d.minutes < 120
                          ? 3
                          : 4
                }
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>
              {data[0].label} — {data[data.length - 1].label}
            </span>
            <span>Less ··· More</span>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 24 }}>
            Progress isn’t about a perfect streak. It’s about coming back.
          </p>
        </Card>
      </div>
      <details
        style={{ marginTop: 24, fontSize: 12, color: "var(--text-muted)" }}
      >
        <summary>View daily totals & how they’re calculated</summary>
        <p>
          Only completed focus sessions count. Each session belongs to its local
          completion date, saved at completion; historical dates remain stable
          when you change timezones. Task completion is across all current
          tasks. The current streak includes today or ends yesterday.
        </p>
        <table style={{ width: "100%", marginTop: 12 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Focus minutes</th>
              <th>Sessions</th>
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
