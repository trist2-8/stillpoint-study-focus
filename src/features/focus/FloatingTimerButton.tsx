import { PictureInPicture2, ExternalLink, X } from "lucide-react";
import { useCopy } from "../personal/copy";
import { requestFloatingTimer, useMiniWindow } from "./mini-window";
export default function FloatingTimerButton() {
  const copy = useCopy();
  const { status } = useMiniWindow();
  const failed = status === "blocked" || status === "unavailable";
  return (
    <div className="floating-control">
      <button
        className="button"
        type="button"
        aria-label={copy("Đồng hồ nổi", "Floating timer")}
        disabled={status === "opening"}
        onClick={() => void requestFloatingTimer()}
      >
        <PictureInPicture2 size={18} />
        {status === "opening"
          ? copy("Đang mở…", "Opening…")
          : copy("Đồng hồ nổi", "Floating timer")}
      </button>
      {status !== "closed" && (
        <div className="floating-feedback" role="status">
          {failed && (
            <button
              className="floating-feedback-close"
              type="button"
              aria-label={copy("Đóng thông báo", "Dismiss notice")}
              onClick={() => useMiniWindow.setState({ status: "closed" })}
            >
              <X size={16} />
            </button>
          )}
          <p>
            {status === "opening"
              ? copy(
                  "Đang yêu cầu cửa sổ nổi…",
                  "Requesting a floating window…",
                )
              : status === "native"
                ? copy(
                    "Đồng hồ đang mở trong cửa sổ nổi.",
                    "Timer is open in a floating window.",
                  )
                : status === "popup"
                  ? copy(
                      "Đã mở cửa sổ thường; cửa sổ này không được ghim trên ứng dụng khác.",
                      "Opened a normal window; it is not pinned above other apps.",
                    )
                  : status === "blocked"
                    ? copy(
                        "Trình duyệt đang chặn cửa sổ bật lên. Cho phép cửa sổ bật lên cho trang này rồi thử lại.",
                        "Pop-ups are blocked. Allow pop-ups for this site and try again.",
                      )
                    : copy(
                        "Trình duyệt này chưa mở được cửa sổ luôn nổi. Bạn có thể mở cửa sổ thường.",
                        "An always-on-top window is unavailable here. You can open a normal window.",
                      )}
          </p>
          {failed && (
            <button
              type="button"
              onClick={() => void requestFloatingTimer(true)}
            >
              <ExternalLink size={15} />
              {copy("Mở cửa sổ thường", "Open normal window")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
