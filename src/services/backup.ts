import {
  validPersonal,
  normalizePersonal,
  emptyPersonal,
} from "../features/personal/domain/personal-study";
import {
  decode,
  validSettings,
  validTask,
  validSession,
  type Data,
} from "./storage";
import { defaults } from "../types";
import { idle, pause } from "../features/focus/domain/timer-engine";
export type PortableData = Pick<
  Data,
  "settings" | "tasks" | "sessions" | "personal"
>;
export function portableData(data: Data): PortableData {
  return {
    personal: data.personal ?? { ...emptyPersonal },
    settings: data.settings,
    tasks: data.tasks,
    sessions: data.sessions,
  };
}
export function parsePortable(value: unknown): PortableData {
  if (!value || typeof value !== "object") throw new Error("Invalid backup");
  const data = value as Partial<PortableData>;
  if (
    (data.personal !== undefined && !validPersonal(data.personal)) ||
    !validSettings(data.settings) ||
    !Array.isArray(data.tasks) ||
    !data.tasks.every(validTask) ||
    !Array.isArray(data.sessions) ||
    !data.sessions.every(validSession)
  )
    throw new Error("Invalid backup");
  if (
    new Set(data.tasks.map((task) => task.id)).size !== data.tasks.length ||
    new Set(data.sessions.map((session) => session.id)).size !==
      data.sessions.length
  )
    throw new Error("Duplicate records");
  return {
    personal: normalizePersonal(data.personal, data.sessions),
    settings: { ...defaults, ...data.settings },
    tasks: data.tasks,
    sessions: data.sessions,
  };
}
export function exportBackup(data: Data) {
  return JSON.stringify(
    {
      application: "focus-flow",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { ...portableData(data), timer: pause(data.timer) },
    },
    null,
    2,
  );
}
export function importBackup(raw: string): Data {
  if (raw.length > 10_000_000) throw new Error("Backup too large");
  const envelope = JSON.parse(raw);
  if (
    !envelope ||
    envelope.application !== "focus-flow" ||
    envelope.version !== 1
  )
    throw new Error("Unsupported backup");
  const portable = parsePortable(envelope.data);
  const restored = decode(JSON.stringify({ version: 1, data: envelope.data }));
  return {
    ...portable,
    tasks: restored.tasks,
    timer:
      restored.timer.status === "RUNNING"
        ? pause(restored.timer)
        : restored.timer,
  };
}
export function fromCloud(data: PortableData, current: Data): Data {
  const taskId = current.timer.currentTaskId;
  return {
    ...data,
    timer:
      current.timer.status === "RUNNING" || current.timer.status === "PAUSED"
        ? {
            ...current.timer,
            currentTaskId: data.tasks.some((task) => task.id === taskId)
              ? taskId
              : null,
          }
        : idle(
            current.timer.mode,
            data.settings,
            data.tasks.some((task) => task.id === taskId) ? taskId : null,
          ),
  };
}
