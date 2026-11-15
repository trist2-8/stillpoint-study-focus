import { lazy, Suspense, useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Play,
  ListTodo,
  ChartNoAxesCombined,
  PanelLeftClose,
  Sun,
  Moon,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useApp } from "../stores/app-store";
import { IconButton } from "../components/ui";
import FocusPage from "../features/focus/FocusPage";
import SettingsModal from "../features/settings/SettingsModal";
const TasksPage = lazy(() => import("../features/tasks/TasksPage"));
const InsightsPage = lazy(() => import("../features/analytics/InsightsPage"));
const links = [
  { path: "/", label: "Tập trung", icon: Play },
  { path: "/tasks", label: "Việc học", icon: ListTodo },
  { path: "/insights", label: "Tiến độ", icon: ChartNoAxesCombined },
];
function Navigation({
  mobile = false,
  onSettings,
}: {
  mobile?: boolean;
  onSettings?: () => void;
}) {
  return (
    <nav
      aria-label={mobile ? "Điều hướng di động" : "Điều hướng chính"}
      className={mobile ? "mobile-nav" : "nav"}
    >
      {links.map(({ path, label, icon: Icon }) => (
        <NavLink end={path === "/"} key={path} to={path} title={label}>
          <Icon size={20} />
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
      {mobile && (
        <button
          className="mobile-settings"
          aria-label="Mở cài đặt"
          onClick={onSettings}
        >
          <Settings size={20} />
          <span>Cài đặt</span>
        </button>
      )}
    </nav>
  );
}
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useApp((s) => s.settings);
  const toast = useApp((s) => s.toast);
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const refresh = () => {
      useApp.getState().tick();
      setNow(new Date());
    };
    refresh();
    const interval = setInterval(refresh, 1000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        settings.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : settings.theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.theme]);
  useEffect(() => {
    document.documentElement.dataset.palette = settings.palette ?? "lavender";
  }, [settings.palette]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => useApp.getState().notify(""), 6000);
    return () => clearTimeout(id);
  }, [toast]);
  const toggleTheme = () =>
    useApp.getState().settingsSave({
      ...settings,
      theme:
        document.documentElement.dataset.theme === "dark" ? "light" : "dark",
    });
  return (
    <div
      className={`shell reference-shell ${collapsed ? "collapsed" : ""} ${location.pathname === "/" ? "is-focus" : ""}`}
    >
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Trang chủ Focus Flow">
          <span className="brand-icon">
            <svg viewBox="0 0 100 80" aria-hidden="true">
              <defs>
                <linearGradient id="lotus" x2="1" y2="1">
                  <stop stopColor="#c99aff" />
                  <stop offset="1" stopColor="#7a42f5" />
                </linearGradient>
              </defs>
              <g fill="url(#lotus)" stroke="#f6eaff" strokeWidth="1.3">
                <path d="M50 69C24 66 10 55 8 42 25 35 44 42 50 69Z" />
                <path d="M50 69C76 66 90 55 92 42 75 35 56 42 50 69Z" />
                <path d="M50 66C20 54 16 32 20 17 41 17 52 36 50 66Z" />
                <path d="M50 66C80 54 84 32 80 17 59 17 48 36 50 66Z" />
                <path d="M50 67C28 49 31 23 50 4 69 23 72 49 50 67Z" />
              </g>
            </svg>
          </span>
          <span className="brand-text">Focus Flow</span>
        </NavLink>
        <div>
          <p className="brand-tagline">
            Tìm nhịp học của bạn.
            <br />
            Từng phiên học, từng bước tiến.
          </p>
          <Navigation />
          <button
            className="sidebar-settings"
            aria-label="Mở cài đặt"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={22} />
            <span className="nav-label">Cài đặt</span>
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className="theme-switch"
            aria-label="Đổi giao diện sáng tối"
            onClick={toggleTheme}
          >
            <span className="theme-options">
              <Sun size={21} />
              <Moon size={21} />
            </span>
            <span className="nav-label">Sáng / Tối</span>
          </button>
          <button
            className="profile text-button"
            onClick={() => setSettingsOpen(true)}
          >
            <span className="avatar" aria-hidden="true">
              🌸
            </span>
            <span style={{ textAlign: "left" }}>
              Góc học của bạn<small>Từng bước một.</small>
            </span>
          </button>
          <button
            className="sidebar-collapse"
            aria-label={collapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
            onClick={() => setCollapsed(!collapsed)}
          >
            <LogOut size={23} />
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="header">
          <div className="header-left">
            <IconButton
              label={collapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeftClose />
            </IconButton>
            <span>
              Phòng học của bạn <span style={{ margin: "0 12px" }}> / </span>
              <strong>
                {links.find((l) => l.path === location.pathname)?.label ??
                  "Tập trung"}
              </strong>
            </span>
          </div>
          <div className="header-actions">
            <time dateTime={now.toISOString()}>
              {now.toLocaleDateString("vi-VN", {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <IconButton label="Đổi sáng tối" onClick={toggleTheme}>
              {settings.theme === "dark" ? <Moon /> : <Sun />}
            </IconButton>
            <IconButton
              label="Mở cài đặt"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings />
            </IconButton>
          </div>
        </header>
        <main className="page">
          <Suspense fallback={<p role="status">Đang mở phòng học…</p>}>
            <Routes>
              <Route path="/" element={<FocusPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <footer className="footer">
            <span>Từng việc một. Bạn đang làm rất tốt.</span>
            <span>Focus Flow · Phòng học của bạn</span>
          </footer>
        </main>
      </div>
      <Navigation mobile onSettings={() => setSettingsOpen(true)} />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button
            aria-label="Đóng thông báo"
            onClick={() => useApp.getState().notify("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
