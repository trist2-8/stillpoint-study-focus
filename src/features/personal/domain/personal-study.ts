import type {
  PersonalStudy,
  StudyGoal,
  StudySubject,
  SessionJournal,
  Distraction,
  FocusSession,
  StudyTask,
} from "../../../types";
export const emptyPersonal: PersonalStudy = {
  subjects: [],
  activeSubjectId: null,
  goal: "read",
  journals: [],
  distractions: [],
};
export const goals: StudyGoal[] = [
  "read",
  "practice",
  "write",
  "memorize",
  "review",
];
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max: number) =>
  typeof value === "string" && value.length <= max;
const time = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
export const optionalSubject = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.length > 0 && value.length <= 100);
export const optionalGoal = (value: unknown) =>
  value === undefined || goals.includes(value as StudyGoal);
export function validSubject(value: unknown): value is StudySubject {
  return (
    object(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    value.name.length <= 60 &&
    text(value.notes, 4000) &&
    ["study", "library", "cafe", "forest"].includes(String(value.scene)) &&
    time(value.createdAt)
  );
}
export function validJournal(value: unknown): value is SessionJournal {
  return (
    object(value) &&
    typeof value.sessionId === "string" &&
    value.sessionId.length > 0 &&
    text(value.accomplished, 2000) &&
    text(value.blocked, 2000) &&
    text(value.nextStep, 2000) &&
    ["steady", "fresh", "tired"].includes(String(value.energy)) &&
    time(value.updatedAt) &&
    (value.savedAt === null || time(value.savedAt))
  );
}
export function validDistraction(value: unknown): value is Distraction {
  return (
    object(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.text === "string" &&
    value.text.trim().length > 0 &&
    value.text.length <= 300 &&
    optionalSubject(value.subjectId) &&
    time(value.createdAt) &&
    typeof value.resolved === "boolean"
  );
}
export function validPersonal(value: unknown): value is PersonalStudy {
  if (
    !object(value) ||
    !Array.isArray(value.subjects) ||
    !value.subjects.every(validSubject) ||
    !Array.isArray(value.journals) ||
    !value.journals.every(validJournal) ||
    !Array.isArray(value.distractions) ||
    !value.distractions.every(validDistraction) ||
    !optionalSubject(value.activeSubjectId) ||
    !goals.includes(value.goal as StudyGoal)
  )
    return false;
  return (
    new Set(value.subjects.map((item) => item.id)).size ===
      value.subjects.length &&
    new Set(value.journals.map((item) => item.sessionId)).size ===
      value.journals.length &&
    new Set(value.distractions.map((item) => item.id)).size ===
      value.distractions.length
  );
}
export function normalizePersonal(
  value: unknown,
  sessions: FocusSession[],
): PersonalStudy {
  if (!validPersonal(value)) return { ...emptyPersonal };
  const ids = new Set(value.subjects.map((subject) => subject.id));
  const focusIds = new Set(
    sessions
      .filter((session) => session.type === "FOCUS")
      .map((session) => session.id),
  );
  return {
    ...value,
    activeSubjectId:
      value.activeSubjectId && ids.has(value.activeSubjectId)
        ? value.activeSubjectId
        : null,
    journals: value.journals.filter((journal) =>
      focusIds.has(journal.sessionId),
    ),
    distractions: value.distractions.map((item) => ({
      ...item,
      subjectId:
        item.subjectId && ids.has(item.subjectId) ? item.subjectId : null,
    })),
  };
}
export function sessionSubject(session: FocusSession, tasks: StudyTask[]) {
  return session.subjectId !== undefined
    ? session.subjectId
    : (tasks.find((task) => task.id === session.taskId)?.subjectId ?? null);
}
export function nextStudyTask(
  tasks: StudyTask[],
  subjectId: string | null,
  selectedId: string | null,
  sessions: FocusSession[] = [],
) {
  const available = tasks.filter(
    (task) => !task.isCompleted && (task.subjectId ?? null) === subjectId,
  );
  return (
    available.find((task) => task.id === selectedId) ??
    [...sessions]
      .filter(
        (session) =>
          session.type === "FOCUS" &&
          sessionSubject(session, tasks) === subjectId,
      )
      .sort((left, right) => right.completedAt - left.completedAt)
      .map((session) => available.find((task) => task.id === session.taskId))
      .find(Boolean) ??
    [...available].sort(
      (left, right) =>
        (left.dueAt ?? "9999").localeCompare(right.dueAt ?? "9999") ||
        { high: 0, medium: 1, low: 2 }[left.priority] -
          { high: 0, medium: 1, low: 2 }[right.priority] ||
        left.createdAt - right.createdAt,
    )[0]
  );
}
export function weeklyReview(
  sessions: FocusSession[],
  tasks: StudyTask[],
  personal: PersonalStudy,
  now = new Date(),
) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const recent = sessions.filter(
    (session) =>
      session.type === "FOCUS" &&
      session.status === "COMPLETED" &&
      session.completedAt >= start.getTime() &&
      session.completedAt <= now.getTime(),
  );
  const minutes = recent.reduce(
    (sum, session) => sum + session.actualDurationMs / 60000,
    0,
  );
  const subjects = new Map<string | null, number>();
  const hours = new Map<number, number>();
  for (const session of recent) {
    const subjectId = sessionSubject(session, tasks);
    subjects.set(
      subjectId,
      (subjects.get(subjectId) ?? 0) + session.actualDurationMs / 60000,
    );
    const hour = new Date(session.startedAt).getHours();
    hours.set(hour, (hours.get(hour) ?? 0) + 1);
  }
  const distribution = [...subjects]
    .map(([id, minutes]) => ({
      id,
      name:
        personal.subjects.find((subject) => subject.id === id)?.name ?? null,
      minutes,
    }))
    .sort((left, right) => right.minutes - left.minutes);
  const recentIds = new Set(recent.map((session) => session.id));
  const journals = personal.journals.filter(
    (journal) => journal.savedAt !== null && recentIds.has(journal.sessionId),
  );
  const bestHour = [...hours].sort(
    (left, right) => right[1] - left[1] || left[0] - right[0],
  )[0];
  const unfinished = tasks.filter(
    (task) =>
      !task.isCompleted && recent.some((session) => session.taskId === task.id),
  );
  return {
    recent,
    minutes,
    distribution,
    journals,
    unfinished,
    bestHour: recent.length >= 3 ? bestHour : null,
    tired: journals.filter((journal) => journal.energy === "tired").length,
  };
}
