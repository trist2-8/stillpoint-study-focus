import GrowthPlant from "../focus/illustrations/GrowthPlant";
import { useState } from "react";
import { ArrowUpRight, BookOpen, NotebookPen, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../stores/app-store";
import { emptyPersonal, weeklyReview } from "./domain/personal-study";
import { useCopy } from "./copy";
import { formatMinutes } from "../analytics/domain/analytics-calculations";
import { locale } from "../../i18n";
export default function WeeklyReview() {
  const copy = useCopy();
  const state = useApp();
  const personal = state.personal ?? emptyPersonal;
  const [subject, setSubject] = useState("all");
  const review = weeklyReview(state.sessions, state.tasks, personal);
  const total = review.distribution.reduce(
    (sum, item) => sum + item.minutes,
    0,
  );
  const journalIds = new Set(
    state.sessions
      .filter(
        (session) =>
          subject === "all" ||
          (session.subjectId ??
            state.tasks.find((task) => task.id === session.taskId)?.subjectId ??
            "") === subject,
      )
      .map((session) => session.id),
  );
  const journals = personal.journals
    .filter(
      (journal) =>
        journal.savedAt !== null && journalIds.has(journal.sessionId),
    )
    .sort((left, right) => (right.savedAt ?? 0) - (left.savedAt ?? 0));
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return (
    <div className="weekly-review">
      <section className="review-overview">
        <div className="review-total">
          <div className="review-plant">
            <GrowthPlant
              completed={
                state.sessions.filter((session) => session.type === "FOCUS")
                  .length
              }
            />
          </div>
          <small>
            {start.toLocaleDateString(locale(), {
              day: "numeric",
              month: "short",
            })}{" "}
            —{" "}
            {new Date().toLocaleDateString(locale(), {
              day: "numeric",
              month: "short",
            })}
          </small>
          <strong>{formatMinutes(review.minutes)}</strong>
          <p>
            {review.recent.length}{" "}
            {copy(
              "phiên đã hoàn tất trong 7 ngày qua.",
              "completed sessions over the last 7 days.",
            )}
          </p>
          <Link to="/">
            {copy("Trở về bàn học", "Back to your desk")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="review-subjects">
          <h2>
            <BookOpen size={18} />
            {copy("Bạn đã dành thời gian cho…", "You made time for…")}
          </h2>
          {review.distribution.length ? (
            <ul>
              {review.distribution.map((item) => (
                <li key={item.id ?? "general"}>
                  <div>
                    <span>
                      {item.name ?? copy("Góc học chung", "General study")}
                    </span>
                    <strong>{formatMinutes(item.minutes)}</strong>
                  </div>
                  <meter
                    min={0}
                    max={Math.max(1, total)}
                    value={item.minutes}
                    aria-label={
                      item.name ?? copy("Góc học chung", "General study")
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="review-empty">
              {copy(
                "Chưa có phiên tập trung trong tuần này. Hoàn tất phiên đầu tiên để thấy nhịp học của mình.",
                "No focus sessions this week yet. Finish your first session to see your rhythm.",
              )}
            </p>
          )}
        </div>
      </section>
      <section className="review-observations">
        <article>
          <h3>
            <Clock3 size={18} />
            {copy("Khung giờ thường học", "Your usual study hour")}
          </h3>
          <p>
            {review.bestHour
              ? copy(
                  "Bạn bắt đầu nhiều phiên hoàn tất nhất vào ",
                  "Most completed sessions started at ",
                ) +
                String(review.bestHour[0]).padStart(2, "0") +
                ":00–" +
                String((review.bestHour[0] + 1) % 24).padStart(2, "0") +
                ":00."
              : copy(
                  "Cần ít nhất 3 phiên trong tuần để nhận ra một khung giờ thường học.",
                  "Complete at least 3 sessions this week to see a usual study hour.",
                )}
          </p>
          <small>
            {copy(
              "Đây là thói quen theo lịch sử, không phải đánh giá hiệu quả.",
              "This describes your history, not the quality of your focus.",
            )}
          </small>
        </article>
        <article>
          <h3>{copy("Nhịp học vừa sức", "A comfortable pace")}</h3>
          <p>
            {review.journals.length < 3
              ? copy(
                  "Ghi cảm nhận sau 3 phiên để có một gợi ý dựa trên trải nghiệm của bạn.",
                  "Record how 3 sessions felt to get a suggestion based on your experience.",
                )
              : review.tired / review.journals.length >= 0.5
                ? copy(
                    "Bạn ghi lại khá mệt ở nhiều phiên. Tuần tới, có thể thử phiên ngắn hơn hoặc nghỉ lâu hơn.",
                    "You felt tired in several sessions. Consider a shorter focus session or a longer break next week.",
                  )
                : copy(
                    "Phần lớn nhật ký cho thấy nhịp học vừa sức. Bạn có thể giữ nhịp hiện tại và quan sát thêm.",
                    "Most journal entries describe a comfortable pace. Keep your rhythm and observe how it feels.",
                  )}
          </p>
          <small>
            {copy(
              "Mọi thay đổi thời lượng đều do bạn quyết định.",
              "You decide whether to change your durations.",
            )}
          </small>
        </article>
        <article>
          <h3>
            {copy("Những việc còn một đoạn nữa", "A little further to go")}
          </h3>
          <p>
            {review.unfinished.length
              ? review.unfinished
                  .slice(0, 3)
                  .map((task) => task.title)
                  .join(" · ")
              : copy(
                  "Không có việc dang dở nào đã được học trong tuần này.",
                  "No unfinished tasks were studied this week.",
                )}
          </p>
          <small>
            {copy(
              "Chỉ liệt kê việc chưa hoàn thành có phiên học trong tuần.",
              "Only unfinished tasks with a completed session this week are listed.",
            )}
          </small>
        </article>
      </section>
      <section className="journal-history">
        <div className="history-heading">
          <h2>
            <NotebookPen size={20} />
            {copy("Những trang đã viết", "Pages you have written")}
          </h2>
          <label className="field">
            <span className="sr-only">
              {copy("Môn học trong nhật ký", "Journal subject")}
            </span>
            <select
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              <option value="all">
                {copy("Tất cả môn học", "All subjects")}
              </option>
              <option value="">{copy("Góc học chung", "General study")}</option>
              {personal.subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {journals.length ? (
          <ol>
            {journals.map((journal) => {
              const session = state.sessions.find(
                (item) => item.id === journal.sessionId,
              );
              const task = state.tasks.find(
                (item) => item.id === session?.taskId,
              );
              return (
                <li key={journal.sessionId}>
                  <details>
                    <summary>
                      <time>
                        {new Date(
                          session?.completedAt ?? journal.savedAt!,
                        ).toLocaleDateString(locale(), {
                          day: "numeric",
                          month: "short",
                        })}
                      </time>
                      <span>
                        {task?.title ?? copy("Tập trung tự do", "Free focus")}
                      </span>
                      <small>{copy("Mở trang", "Read page")}</small>
                    </summary>
                    <dl>
                      {(
                        [
                          ["accomplished", "Đã làm được", "Accomplished"],
                          ["blocked", "Còn vướng", "Still working on"],
                          ["nextStep", "Bước tiếp theo", "Next step"],
                        ] as const
                      ).map(([key, vi, en]) =>
                        journal[key] ? (
                          <div key={key}>
                            <dt>{copy(vi, en)}</dt>
                            <dd>{journal[key]}</dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                  </details>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="review-empty">
            {copy(
              "Nhật ký đã lưu sẽ xuất hiện ở đây. Bản nháp vẫn nằm trên bàn học.",
              "Saved journals appear here. Drafts stay on your desk.",
            )}
          </p>
        )}
      </section>
    </div>
  );
}
