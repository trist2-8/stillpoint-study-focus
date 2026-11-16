import { useSyncExternalStore } from "react";
import type { Language } from "./types";
const english: Record<string, string> = {
  "Hôm nay": "Today",
  "Tổng kết": "Reflection",
  "Môn học không hợp lệ.": "Invalid subject.",
  "Môn học này đã có.": "This subject already exists.",
  "Nhật ký không hợp lệ.": "Invalid journal entry.",
  "Tiếp theo: {0}": "Next: {0}",
  "Sửa {0}": "Edit {0}",
  "Xóa {0}": "Delete {0}",
  "Thời gian học bảy ngày qua: {0}": "Study time over the last seven days: {0}",
  "{0} phút": "{0} min",
  "{0} / {1} việc đã hoàn thành. Chọn một việc để bắt đầu phiên học.":
    "{0} / {1} tasks completed. Choose a task to start a session.",
  "{0} · tiến độ tập trung": "{0} · focus progress",
  "“{0}” sẽ bị xóa. Các phiên đã hoàn tất vẫn được giữ trong Tiến độ.":
    "“{0}” will be deleted. Completed sessions remain in Progress.",
  "{0} ngày": "{0} days",
  "{0}: {1} phiên hoàn tất, {2}": "{0}: {1} completed sessions, {2}",
  "Hoạt động học tập trong {0} ngày qua":
    "Study activity over the last {0} days",
  "{0} phiên hoàn tất · Chọn một ngày để xem chi tiết.":
    "{0} completed sessions · Select a day for details.",
  "Cây học tập: giai đoạn {0} trên 4, {1} phiên tập trung đã hoàn tất":
    "Study plant: stage {0} of 4, {1} completed focus sessions",
  "Hoàn tất": "Completed",
  "Tập trung": "Focus",
  "Việc học": "Study tasks",
  "Tiến độ": "Progress",
  "Cài đặt": "Settings",
  "Mở cài đặt": "Open settings",
  "Đổi giao diện sáng tối": "Toggle light and dark mode",
  "Sáng / Tối": "Light / Dark",
  "Góc học của bạn": "Your study corner",
  "Từng bước một.": "One step at a time.",
  "Tìm nhịp học của bạn.": "Find your study rhythm.",
  "Từng phiên học, từng bước tiến.": "One session, one step forward.",
  "Phòng học của bạn": "Your study room",
  "Phòng học tập trung": "Focus room",
  "Đang mở phòng học…": "Opening your study room…",
  "Một khoảng yên để học.": "A quiet space to study.",
  "Chọn một việc, dành trọn một phiên.":
    "Choose a task and give it one full session.",
  "Bật thông báo": "Enable notifications",
  "Chế độ phiên": "Session mode",
  "Phiên tập trung": "Focus session",
  "Nghỉ ngắn": "Short break",
  "Nghỉ dài": "Long break",
  "Nghỉ ngơi một chút.": "Take a short rest.",
  "Chọn việc cho phiên này": "Choose a task for this session",
  "Bắt đầu": "Start",
  "Bắt đầu tập trung": "Start focus",
  "Bắt đầu nghỉ": "Start break",
  "Tạm dừng": "Pause",
  "Tiếp tục": "Resume",
  "Đặt lại phiên": "Reset session",
  "Bỏ qua phiên": "Skip session",
  "Tiếp theo": "Next",
  "Tự động lặp chu kỳ": "Auto repeat cycle",
  "Chuyển phiên theo cài đặt của bạn": "Switch sessions using your settings",
  "Nghỉ dài sau mỗi": "Long break after every",
  phiên: "sessions",
  "Thêm việc": "Add task",
  "Việc học của bạn": "Your study tasks",
  "việc đã hoàn thành": "tasks completed",
  "Bạn muốn học gì trong phiên này?":
    "What would you like to study this session?",
  "+ Thêm việc học đầu tiên": "+ Add your first study task",
  "Xem tất cả việc học": "View all study tasks",
  "Nhịp học trong tuần": "Weekly rhythm",
  "7 ngày qua": "Last 7 days",
  "Hoàn tất một phiên để bắt đầu ghi lại nhịp học.":
    "Complete a session to start tracking your rhythm.",
  "Tích lũy từng phiên": "Session progress",
  "ngày liên tiếp": "day streak",
  "Thời gian tập trung đã hoàn tất": "Completed focus time",
  "phiên học · Cây lớn lên sau mỗi phiên hoàn tất.":
    "sessions · Your plant grows after each completed session.",
  "Lịch học của bạn": "Your study calendar",
  "30 ngày qua": "Last 30 days",
  "Mỗi ô là một ngày. Màu đậm hơn khi bạn hoàn thành nhiều phiên học hơn.":
    "Each tile is a day. Darker means more completed sessions.",
  "Chưa học": "No study",
  "4+ phiên": "4+ sessions",
  "Chưa có phiên hoàn tất. Học xong một phiên Pomodoro để tô ô đầu tiên.":
    "No completed sessions yet. Finish a Pomodoro to fill the first tile.",
  "Việc học, từng bước một.": "Study tasks, one step at a time.",
  "Chọn một việc để bắt đầu phiên học.":
    "Choose a task to start a focus session.",
  "Tất cả việc học": "All study tasks",
  "Đang thực hiện": "In progress",
  "Đã hoàn thành": "Completed",
  "Tất cả mức ưu tiên": "All priorities",
  Cao: "High",
  Vừa: "Medium",
  Thấp: "Low",
  "Mới nhất": "Newest",
  "Mức ưu tiên": "Priority",
  "Hạn hoàn thành": "Due date",
  "Tìm trong danh sách việc học…": "Search study tasks…",
  "Bắt đầu với một việc học.": "Start with a study task.",
  "Không có việc học phù hợp.": "No matching study tasks.",
  "Thử từ khóa hoặc bộ lọc khác để tìm việc học.":
    "Try another search or filter.",
  "Thêm việc cần học, chọn mức ưu tiên và bắt đầu một phiên Pomodoro.":
    "Add a task, choose a priority, and start a Pomodoro.",
  "Thêm việc học": "Add study task",
  "Sửa việc học": "Edit study task",
  "Xóa việc học này?": "Delete this study task?",
  Hủy: "Cancel",
  "Xác nhận": "Confirm",
  Đóng: "Close",
  "Lưu thay đổi": "Save changes",
  "Tạo việc học": "Create study task",
  "Tên việc học": "Study task name",
  "Mô tả (không bắt buộc)": "Description (optional)",
  "Bạn muốn học gì?": "What do you want to study?",
  "Số phiên dự kiến": "Estimated sessions",
  "Hạn hoàn thành (không bắt buộc)": "Due date (optional)",
  "Hãy nhập tên việc học.": "Enter a study task name.",
  "Xem bạn đã đi xa đến đâu.": "See how far you have come.",
  "Những khoảnh khắc tập trung nhỏ sẽ tạo nên điều có ý nghĩa.":
    "Small moments of focus add up.",
  "Tổng thời gian tập trung": "Total focus time",
  "Pomodoro đã hoàn tất": "Pomodoros completed",
  "Phiên trung bình": "Average session",
  "Tỷ lệ hoàn thành việc học": "Study task completion",
  "Chuỗi ngày học hiện tại": "Current study streak",
  "Khoảng thời gian tiến độ": "Progress range",
  "90 ngày qua": "Last 90 days",
  "Thời gian tập trung theo tuần": "Weekly focus time",
  "Bảy ngày qua, từng phiên một.":
    "The last seven days, one session at a time.",
  "Xu hướng tập trung": "Focus trend",
  "Phút tập trung mỗi ngày": "Focus minutes per day",
  "Sự tập trung của bạn đi đâu": "Where your focus goes",
  "Phiên tập trung hoàn tất theo việc": "Completed focus sessions by task",
  "Nhịp học của bạn sẽ dần hiện ra ở đây.":
    "Your study rhythm will appear here.",
  "Hoàn thành một phiên để xem tiến độ.":
    "Complete a session to see your progress.",
  "Xem tổng từng ngày và cách tính": "View daily totals and calculation",
  "Cài đặt phòng học": "Study room settings",
  "Thiết lập một nhịp học vừa sức với bạn.": "Set a rhythm that works for you.",
  "Nhịp học của bạn": "Your study rhythm",
  "Không gian học": "Study space",
  "Mục tiêu mỗi ngày": "Daily goals",
  "Âm thanh & thông báo": "Sound & notifications",
  "Lưu cài đặt": "Save settings",
  "Cài đặt đã lưu": "Settings saved",
  "Có thay đổi chưa lưu": "Unsaved changes",
  "Về mặc định": "Reset to defaults",
  Sáng: "Light",
  Tối: "Dark",
  "Theo hệ thống": "System",
  "Hoa oải hương": "Lavender",
  "Đêm xanh": "Midnight",
  "Rừng yên tĩnh": "Quiet forest",
  "Nghe thử âm thanh": "Preview sound",
  "Thông báo trình duyệt": "Browser notifications",
  "Hiện mèo đồng hành": "Show study cat",
  "Ngôn ngữ": "Language",
  "Tiếng Việt": "Vietnamese",
  "Tiếng Anh": "English",
  "Cảnh phòng học": "Study room scene",
  "Phòng học": "Study room",
  "Quán cà phê": "Café",
  "Rừng mưa": "Rainforest",
  "Sao lưu & khôi phục": "Backup & restore",
  "Tải bản sao lưu": "Export backup",
  "Khôi phục từ tệp": "Restore from file",
  "Đã xuất bản sao lưu.": "Backup exported.",
  "Đã khôi phục dữ liệu.": "Data restored.",
  "Tệp sao lưu không hợp lệ.": "This backup file is invalid.",
  "Tùy chỉnh chuyển phiên": "Session transition options",
  "Âm báo ngắn khi hết giờ học hoặc nghỉ.":
    "A short sound when a focus or break ends.",
  "Đồng hồ luôn hiển thị trên tên tab.":
    "The timer always appears in the browser tab.",
  "Tự động bắt đầu nghỉ": "Auto-start breaks",
  "Tự động bắt đầu tập trung": "Auto-start focus",
  "Thời gian tập trung (phút)": "Focus duration (minutes)",
  "Nghỉ ngắn (phút)": "Short break (minutes)",
  "Nghỉ dài (phút)": "Long break (minutes)",
  "Nghỉ dài sau số phiên": "Long break after sessions",
  "Số phiên tập trung": "Focus sessions",
  "Đã lưu cài đặt phòng học.": "Study room settings saved.",
  "Đã chuyển sang": "Switched to",
  "Vòng lặp đang tiếp tục.": "The cycle is continuing.",
  "Đã hoàn tất phiên tập trung. Bạn đã tiến thêm một bước.":
    "Focus session complete. One step further.",
  "Đã hết giờ nghỉ. Bạn đã sẵn sàng cho phiên học tiếp theo?":
    "Break complete. Ready for the next session?",
  "Điều hướng di động": "Mobile navigation",
  "Điều hướng chính": "Main navigation",
  "Trang chủ Focus Flow": "Focus Flow home",
  "Mở thanh bên": "Expand sidebar",
  "Thu gọn thanh bên": "Collapse sidebar",
  "Đổi sáng tối": "Toggle theme",
  "Từng việc một. Bạn đang làm rất tốt.":
    "One task at a time. You are doing well.",
  "Focus Flow · Phòng học của bạn": "Focus Flow · Your study room",
  "Đóng thông báo": "Dismiss notification",
  "Đóng hộp thoại": "Close dialog",
  "Trình duyệt này không hỗ trợ thông báo.":
    "This browser does not support notifications.",
  "Đã bật thông báo kết thúc phiên.": "Session notifications enabled.",
  "Bạn có thể bật thông báo trong cài đặt trình duyệt.":
    "Enable notifications in your browser settings.",
  "Từng trang một.": "One page at a time.",
  "+ Thêm việc học": "+ Add study task",
  "Tự động lặp chu kỳ · Nghỉ dài sau mỗi":
    "Automatic cycle · Long break after every",
  "Việc học đã hoàn thành": "Completed study tasks",
  "Mở lại": "Reopen",
  "Hoàn thành": "Complete",
  "Rời phiên hiện tại?": "Leave this session?",
  "Phiên chưa hoàn tất sẽ không được tính vào tiến độ.":
    "Unfinished sessions will not count towards progress.",
  "Tìm việc học": "Search study tasks",
  "Lọc việc học": "Filter tasks",
  "Lọc mức ưu tiên": "Filter priority",
  "Sắp xếp việc học": "Sort study tasks",
  "Mức ưu tiên:": "Priority:",
  "Hạn:": "Due:",
  "Đổi việc đang tập trung?": "Switch the current task?",
  "Phiên chưa hoàn tất sẽ không được ghi lại. Bạn cần bấm Bắt đầu để học việc mới.":
    "The unfinished session will not be recorded. Press Start to work on the new task.",
  "Đã cập nhật việc học.": "Task updated.",
  "Đã thêm việc học.": "Task added.",
  "Nhẹ nhàng, quen thuộc": "Soft and familiar",
  "Yên tĩnh, sâu lắng": "Quiet and deep",
  "Dịu mắt, gần thiên nhiên": "Calm and natural",
  "Cân bằng": "Balanced",
  "Học sâu": "Deep focus",
  "Khởi động nhẹ": "Gentle start",
  "Kiểm tra lại các giá trị: thời lượng từ 1–180 phút, nghỉ dài sau 1–12 phiên.":
    "Check your values: 1–180 minutes and a long break after 1–12 sessions.",
  "Trình duyệt này chưa hỗ trợ thông báo. Hãy tắt thông báo trình duyệt để lưu các lựa chọn còn lại.":
    "Notifications are not supported. Turn them off to save your other settings.",
  "Chưa được cấp quyền thông báo. Bạn có thể cấp quyền trong trình duyệt, hoặc tắt mục này rồi lưu lại.":
    "Notification permission is missing. Grant permission or turn this option off and save again.",
  "Không thể lưu cài đặt.": "Could not save settings.",
  "Đang phát âm thanh kết thúc phiên.": "Playing the completion sound.",
  "Chưa phát được âm thanh. Hãy kiểm tra âm lượng và quyền phát âm thanh của trình duyệt.":
    "Could not play audio. Check your volume and browser playback permission.",
  "Thiết lập một nhịp học vừa sức với bạn. Mọi thay đổi được lưu khi bạn nhấn":
    "Set a comfortable study rhythm. Changes are saved when you press",
  "Chọn một nhịp mẫu hoặc tự điều chỉnh thời lượng.":
    "Choose a preset or set your own durations.",
  "Nhịp học mẫu": "Study presets",
  "phút học ·": "min focus ·",
  "phút nghỉ": "min break",
  "Tập trung (phút)": "Focus (minutes)",
  phút: "min",
  "Phiên đang chạy giữ nguyên thời lượng. Giá trị mới áp dụng từ phiên tiếp theo.":
    "The current session keeps its duration. New values apply from the next session.",
  "Hết giờ học sẽ vào giờ nghỉ; hết giờ nghỉ sẽ bắt đầu phiên học mới.":
    "Focus ends with a break; the next focus session starts when the break ends.",
  "Thứ tự chu kỳ": "Cycle order",
  "Lặp lại": "Repeat",
  "Sau mỗi": "After every",
  "phiên tập trung hoàn tất, nghỉ dài thay cho nghỉ ngắn. Bạn có thể tạm dừng bất cứ lúc nào.":
    "completed focus sessions, a long break replaces the short break. Pause at any time.",
  "Chuyển sang giờ nghỉ ngay khi hoàn tất phiên tập trung.":
    "Start a break as soon as focus ends.",
  "Tiếp tục học ngay khi giờ nghỉ kết thúc.":
    "Start the next focus session when the break ends.",
  "Xem thử giao diện ngay trước khi lưu.": "Preview your space before saving.",
  "Chế độ sáng tối": "Appearance mode",
  "Bảng màu": "Color palette",
  "Một người bạn nhỏ bên góc học trên màn hình rộng.":
    "A little companion in your study corner on larger screens.",
  "Tiến bộ từng chút, theo sức của bạn.": "Make progress at your own pace.",
  "Nhắc nhẹ khi đến lúc đổi nhịp.": "A gentle reminder to change pace.",
  "Phát âm thanh khi hoàn tất phiên": "Play sound when a session ends",
  "Cần cấp quyền khi lưu. Đồng hồ luôn hiển thị trên tên tab.":
    "Permission is requested when saving. The timer stays in your tab title.",
  "Đang lưu…": "Saving…",
  "Việc đã lưu": "Archived task",
  "Tập trung tự do": "Free focus",
  "Biểu đồ thời gian tập trung bảy ngày qua":
    "Focus time over the last seven days",
  "Phút tập trung": "Focus minutes",
  "Phút tập trung mỗi ngày ·": "Daily focus minutes ·",
  ngày: "days",
  "Phân bố phiên học theo việc": "Sessions by task",
  "ngày qua ·": "days ·",
  "Tiến bộ không cần một chuỗi ngày hoàn hảo. Điều quan trọng là bạn quay lại.":
    "Progress does not require a perfect streak. What matters is coming back.",
  "Chỉ phiên tập trung đã hoàn tất mới được tính. Mỗi phiên thuộc về ngày hoàn tất theo giờ địa phương. Việc học tính trên toàn bộ danh sách hiện tại. Chuỗi ngày gồm hôm nay hoặc kết thúc từ hôm qua.":
    "Only completed focus sessions count, grouped by local completion date. Task completion uses your current list. A streak includes today or ends yesterday.",
  Ngày: "Date",
  "Số phiên": "Sessions",
  "Giờ hệ thống đã thay đổi. Đồng hồ đã tạm dừng; bạn có thể tiếp tục khi sẵn sàng.":
    "Your system clock changed. The timer is paused; resume when ready.",
  "phiên tập trung": "focus session",
  "nghỉ ngắn": "short break",
  "nghỉ dài": "long break",
  "Bạn đã vắng mặt khá lâu. Vòng lặp đã tạm dừng; hãy kiểm tra tiến độ trước khi tiếp tục.":
    "You have been away for a while. The cycle is paused; review progress before resuming.",
  ". Vòng lặp đang tiếp tục.": ". The cycle is continuing.",
  "Đã chuyển phiên. Trình duyệt đã chặn âm thanh.":
    "Session changed. Your browser blocked the sound.",
  "Việc học không hợp lệ": "Invalid study task",
  "Vui lòng nhập cài đặt hợp lệ.": "Enter valid settings.",
  "Không thể lưu thay đổi": "Unable to save changes",
  "Không thể lưu thay đổi: bộ nhớ trình duyệt đã đầy hoặc không khả dụng.":
    "Unable to save changes: browser storage is full or unavailable.",
};
let current: Language = "vi";
const listeners = new Set<() => void>();
export function setLanguage(language: Language) {
  if (current === language) return;
  current = language;
  listeners.forEach((listener) => listener());
}
export function getLanguage() {
  return current;
}
export function tr(text: string, language: Language = current) {
  const key = text.replace(/\s+/g, " ").trim();
  if (language !== "en" || !english[key]) return text;
  return (
    (text.match(/^\s*/)?.[0] ?? "") +
    english[key] +
    (text.match(/\s*$/)?.[0] ?? "")
  );
}
export function useI18n() {
  const language = useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, getLanguage);
  return { language, t: tr };
}
export function locale() {
  return current === "en" ? "en-US" : "vi-VN";
}
export function trf(text: string, values: unknown[]) {
  return tr(text).replace(/\{(\d+)\}/g, (_, index) =>
    String(values[Number(index)]),
  );
}
