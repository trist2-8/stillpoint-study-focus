import { useI18n } from "../../i18n";
import type { StudyGoal } from "../../types";
export function useCopy() {
  const { language } = useI18n();
  return (vi: string, en: string) => (language === "vi" ? vi : en);
}
export const goalNames: Record<StudyGoal, [string, string]> = {
  read: ["Đọc tài liệu", "Read"],
  practice: ["Giải bài", "Practice"],
  write: ["Viết", "Write"],
  memorize: ["Ghi nhớ", "Memorize"],
  review: ["Ôn lại", "Review"],
};
