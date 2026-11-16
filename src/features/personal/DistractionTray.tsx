import { useState } from "react";
import { Inbox, Plus } from "lucide-react";
import { useApp } from "../../stores/app-store";
import { emptyPersonal } from "./domain/personal-study";
import { useCopy } from "./copy";
export default function DistractionTray() {
  const copy = useCopy();
  const personal = useApp((state) => state.personal ?? emptyPersonal);
  const [text, setText] = useState("");
  const items = personal.distractions.filter(
    (item) => item.subjectId === personal.activeSubjectId,
  );
  const pending = items.filter((item) => !item.resolved);
  return (
    <section className="distraction-tray">
      <div className="tray-title">
        <Inbox size={19} />
        <h2>{copy("Để sau phiên học", "Leave it for later")}</h2>
        <small>
          {pending.length} {copy("đang chờ", "pending")}
        </small>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          useApp.getState().addDistraction(text);
          setText("");
        }}
      >
        <input
          aria-label={copy("Ý nghĩ chen ngang", "Distracting thought")}
          maxLength={300}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={copy(
            "Ghi nhanh điều vừa nghĩ đến, rồi quay lại học…",
            "Park a thought, then get back to studying…",
          )}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label={copy("Ghi lại để sau", "Save for later")}
        >
          <Plus size={18} />
        </button>
      </form>
      {items.length > 0 && (
        <details>
          <summary>
            {copy("Xem các ghi chú", "View parked thoughts")} ({items.length})
          </summary>
          <ul>
            {[...items].reverse().map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.resolved}
                    onChange={() =>
                      useApp.getState().resolveDistraction(item.id)
                    }
                  />
                  <span className={item.resolved ? "resolved" : ""}>
                    {item.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
