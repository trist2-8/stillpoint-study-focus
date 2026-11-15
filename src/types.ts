export type Mode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";
export type Language = "vi" | "en";
export type RoomScene = "study" | "library" | "cafe" | "forest";
export interface StudyTask {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
  dueAt: string | null;
}
export interface FocusSession {
  id: string;
  taskId: string | null;
  type: Mode;
  status: "COMPLETED";
  startedAt: number;
  completedAt: number;
  plannedDurationMs: number;
  actualDurationMs: number;
  dateKey: string;
}
export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: Language;
  scene: RoomScene;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  dailyFocusGoal: number;
  dailySessionGoal: number;
  soundEnabled: boolean;
  notificationEnabled: boolean;
  companionEnabled?: boolean;
  palette?: "lavender" | "midnight" | "forest";
}
export interface TimerState {
  mode: Mode;
  status: "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED";
  durationMs: number;
  remainingMs: number;
  deadlineAt: number | null;
  startedAt: number | null;
  pausedAt: number | null;
  currentTaskId: string | null;
  sessionId: string;
}
export const defaults: UserSettings = {
  theme: "dark",
  language: "vi",
  scene: "study",
  palette: "lavender",
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: true,
  dailyFocusGoal: 120,
  dailySessionGoal: 6,
  soundEnabled: false,
  notificationEnabled: false,
  companionEnabled: true,
};
