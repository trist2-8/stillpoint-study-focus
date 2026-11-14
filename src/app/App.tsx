import { lazy, Suspense, useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  AudioLines,
  Timer,
  ListTodo,
  ChartNoAxesCombined,
  PanelLeftClose,
  Sun,
  Moon,
  Settings,
  Sprout,
  ArrowUpRight,
  X,
} from "lucide-react";
import { useApp } from "../stores/app-store";
import { IconButton } from "../components/ui";
import FocusPage from "../features/focus/FocusPage";
import SettingsModal from "../features/settings/SettingsModal";
const TasksPage = lazy(() => import("../features/tasks/TasksPage"));
const InsightsPage = lazy(() => import("../features/analytics/InsightsPage"));
const links = [
  { path: "/", label: "Focus", icon: Timer },
  { path: "/tasks", label: "Tasks", icon: ListTodo },
  { path: "/insights", label: "Insights", icon: ChartNoAxesCombined },
];
function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
      className={mobile ? "mobile-nav" : "nav"}
    >
      {links.map(({ path, label, icon: Icon }) => (
        <NavLink end={path === "/"} key={path} to={path} title={label}>
          <Icon size={20} />
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
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
    <div className={`shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Focus Flow home">
          <span className="brand-icon">
            <AudioLines size={23} />
          </span>
          <span className="brand-text">FOCUS FLOW</span>
        </NavLink>
        <div>
          <p className="eyebrow" style={{ marginBottom: 16, paddingLeft: 16 }}>
            Make yourself at home
          </p>
          <Navigation />
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout size={24} />
            <h3>
              A little focus.
              <br />A little growth.
            </h3>
            <p>
              Small steps today.
              <br />
              Meaningful progress tomorrow.
            </p>
          </div>
          <button className="text-button" onClick={toggleTheme}>
            <Sun size={18} />
            <span className="nav-label">Switch appearance</span>
          </button>
          <button
            className="profile text-button"
            onClick={() => setSettingsOpen(true)}
          >
            <span className="avatar">FF</span>
            <span style={{ textAlign: "left" }}>
              Your personal space<small>Make room for progress</small>
            </span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="header">
          <div className="header-left">
            <IconButton
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeftClose />
            </IconButton>
            <span>
              Your study room <span style={{ margin: "0 12px" }}> / </span>
              <strong>
                {links.find((l) => l.path === location.pathname)?.label ??
                  "Focus"}
              </strong>
            </span>
          </div>
          <div className="header-actions">
            <time dateTime={now.toISOString()}>
              {now.toLocaleDateString("en", {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <IconButton label="Toggle theme" onClick={toggleTheme}>
              {settings.theme === "dark" ? <Moon /> : <Sun />}
            </IconButton>
            <IconButton
              label="Open settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings />
            </IconButton>
          </div>
        </header>
        <main className="page">
          <Suspense fallback={<p role="status">Opening your workspace…</p>}>
            <Routes>
              <Route path="/" element={<FocusPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <footer className="footer">
            <span>One thing at a time. You’re doing just fine.</span>
            <span>FOCUS FLOW · THE LIVING STUDY ROOM</span>
          </footer>
        </main>
      </div>
      <Navigation mobile />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => useApp.getState().notify("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
