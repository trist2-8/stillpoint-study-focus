import SoundMixer from "../features/sound/SoundMixer";
import RoomBackdrop from "../features/worlds/RoomBackdrop";
import { loadRoomImages } from "../features/worlds/room-images";
import { useColorMode } from "../features/worlds/WorldScene";
import WorldControls from "../features/worlds/WorldControls";
import WorldGallery from "../features/worlds/WorldGallery";
import { useWorldAppearance } from "../features/worlds/world-preview";
import FloatingTimer from "../features/focus/FloatingTimer";
import { tr, useI18n, locale, setLanguage } from "../i18n";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  House,
  ListTodo,
  ChartNoAxesCombined,
  PanelLeftClose,
  Sun,
  Moon,
  Settings,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useApp } from "../stores/app-store";
import { IconButton } from "../components/ui";
import FocusPage from "../features/focus/FocusPage";
const SettingsModal = lazy(() => import("../features/settings/SettingsModal"));
import { applyAppearance } from "../features/settings/appearance";
import { timerTabTitle } from "../features/focus/domain/timer-tab";
const TasksPage = lazy(() => import("../features/tasks/TasksPage"));
const InsightsPage = lazy(() => import("../features/analytics/InsightsPage"));
const links = [
  { path: "/", label: "Hôm nay", icon: House },
  { path: "/tasks", label: tr("Việc học"), icon: ListTodo },
  { path: "/insights", label: "Tổng kết", icon: ChartNoAxesCombined },
];
function Navigation({
  mobile = false,
  onSettings,
}: {
  mobile?: boolean;
  onSettings?: () => void;
}) {
  useI18n();
  return (
    <nav
      aria-label={mobile ? tr("Điều hướng di động") : tr("Điều hướng chính")}
      className={mobile ? "mobile-nav" : "nav"}
    >
      {links.map(({ path, label, icon: Icon }) => (
        <NavLink end={path === "/"} key={path} to={path} title={tr(label)}>
          <Icon size={20} />
          <span className="nav-label">{tr(label)}</span>
        </NavLink>
      ))}
      {mobile && (
        <button
          className="mobile-settings"
          aria-label={tr("Mở cài đặt")}
          onClick={onSettings}
        >
          <Settings size={20} />
          <span>{tr("Cài đặt")}</span>
        </button>
      )}
    </nav>
  );
}
export default function App() {
  const { language } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const appearance = useWorldAppearance();
  const [worldsOpen, setWorldsOpen] = useState(false);
  const [soundsOpen, setSoundsOpen] = useState(false);
  const colorMode = useColorMode(appearance.theme);
  useEffect(() => {
    void loadRoomImages();
    const sounds = () => setSoundsOpen(true);
    const settings = () => setSettingsOpen(true);
    window.addEventListener("focus-flow:sounds", sounds);
    window.addEventListener("focus-flow:settings", settings);
    return () => {
      window.removeEventListener("focus-flow:sounds", sounds);
      window.removeEventListener("focus-flow:settings", settings);
    };
  }, []);
  useEffect(() => {
    const show = () => setWorldsOpen(true);
    window.addEventListener("focus-flow:worlds", show);
    return () => window.removeEventListener("focus-flow:worlds", show);
  }, []);
  const settings = useApp((s) => s.settings);
  const toast = useApp((s) => s.toast);
  const timer = useApp((state) => state.timer);
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
    setLanguage(settings.language ?? "vi");
    document.documentElement.lang = settings.language ?? "vi";
  }, [settings.language]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applyAppearance(appearance);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [
    appearance.theme,
    appearance.palette,
    appearance.world,
    appearance.worldMotion,
    appearance.studyView,
  ]);
  useEffect(() => {
    document.title = timerTabTitle(timer, now.getTime());
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon)
      favicon.href =
        timer.status === "RUNNING"
          ? timer.mode === "FOCUS"
            ? "/favicon.svg"
            : "/favicon-break.svg"
          : "/favicon.svg";
  }, [timer, now, language]);
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
      className={`shell reference-shell personal-shell ${collapsed ? "collapsed" : ""} ${location.pathname === "/" ? "is-focus" : ""}`}
      data-world={appearance.world}
    >
      {location.pathname === "/" && appearance.studyView !== "desk" && (
        <div className="world-stage-scene immersive-backdrop">
          <RoomBackdrop world={appearance.world} mode={colorMode} />
        </div>
      )}
      <a className="skip-content" href="#study-content">
        {language === "vi" ? "Đến nội dung học" : "Skip to study content"}
      </a>
      <aside className="sidebar">
        <NavLink
          to="/"
          className="brand"
          aria-label={tr("Trang chủ Focus Flow")}
        >
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
            {tr("Tìm nhịp học của bạn.")}
            <br />
            {tr("Từng phiên học, từng bước tiến.")}
          </p>
          <Navigation />
          <button
            className="sidebar-settings"
            aria-label={tr("Mở cài đặt")}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={22} />
            <span className="nav-label">{tr("Cài đặt")}</span>
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className="theme-switch"
            aria-label={tr("Đổi giao diện sáng tối")}
            onClick={toggleTheme}
          >
            <span className="theme-options">
              <Sun size={21} />
              <Moon size={21} />
            </span>
            <span className="nav-label">{tr("Sáng / Tối")}</span>
          </button>
          <button
            className="profile text-button"
            onClick={() => setSettingsOpen(true)}
          >
            <span className="avatar" aria-hidden="true">
              🌸
            </span>
            <span style={{ textAlign: "left" }}>
              {tr("Góc học của bạn")}
              <small>{tr("Từng bước một.")}</small>
            </span>
          </button>
          <button
            className="sidebar-collapse"
            aria-expanded={!collapsed}
            aria-label={
              collapsed ? tr("Mở thanh bên") : tr("Thu gọn thanh bên")
            }
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="header">
          <div className="header-left">
            <IconButton
              label={collapsed ? tr("Mở thanh bên") : tr("Thu gọn thanh bên")}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeftClose />
            </IconButton>
            <span>
              {tr("Phòng học của bạn")}
              <span style={{ margin: "0 12px" }}> / </span>
              <strong>
                {tr(
                  links.find((l) => l.path === location.pathname)?.label ??
                    "Hôm nay",
                )}
              </strong>
            </span>
          </div>
          <div className="header-actions">
            <time dateTime={now.toISOString()}>
              {now.toLocaleDateString(locale(), {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <IconButton label={tr("Đổi sáng tối")} onClick={toggleTheme}>
              {settings.theme === "dark" ? <Moon /> : <Sun />}
            </IconButton>
            <IconButton
              label={tr("Mở cài đặt")}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings />
            </IconButton>
          </div>
        </header>
        <main className="page" id="study-content" tabIndex={-1}>
          <WorldControls focusPage={location.pathname === "/"} />
          {toast && (
            <div className="toast" role="status">
              <span>{toast}</span>
              <button
                aria-label={tr("Đóng thông báo")}
                onClick={() => useApp.getState().notify("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <Suspense fallback={<p role="status">{tr("Đang mở phòng học…")}</p>}>
            <Routes>
              <Route path="/" element={<FocusPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <footer className="footer">
            <span>{tr("Từng việc một. Bạn đang làm rất tốt.")}</span>
            <span>{tr("Focus Flow · Phòng học của bạn")}</span>
          </footer>
        </main>
      </div>
      <Navigation mobile onSettings={() => setSettingsOpen(true)} />
      <FloatingTimer />
      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        </Suspense>
      )}
      {worldsOpen && <WorldGallery onClose={() => setWorldsOpen(false)} />}
      {soundsOpen && <SoundMixer onClose={() => setSoundsOpen(false)} />}
    </div>
  );
}
