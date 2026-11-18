import { useEffect, useRef, useState } from "react";
import { Cloud, Download, Upload, RefreshCw, LogOut } from "lucide-react";
import { cloudClient, readCloud, writeCloud } from "../../services/cloud";
import {
  exportBackup,
  importBackup,
  portableData,
  fromCloud,
} from "../../services/backup";
import { save } from "../../services/storage";
import { useApp } from "../../stores/app-store";
import { useI18n } from "../../i18n";

export default function DataSettings({
  onRestored,
}: {
  onRestored: () => void;
}) {
  const { language } = useI18n();
  const text = (vi: string, en: string) => (language === "vi" ? vi : en);
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<ReturnType<
    typeof importBackup
  > | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [cloudExists, setCloudExists] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!cloudClient) return;
    void cloudClient.auth
      .getSession()
      .then(({ data }) => setAccount(data.session?.user.email ?? null));
    const { data } = cloudClient.auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user.email ?? null);
      setRevision(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await operation();
    } catch {
      setMessage(
        text(
          "Không thể đồng bộ. Kiểm tra kết nối và thử lại; dữ liệu trên máy vẫn được giữ.",
          "Sync failed. Check your connection and try again; local data is safe.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  const inspect = () =>
    run(async () => {
      const remote = await readCloud();
      setRevision(remote?.revision ?? 0);
      setCloudExists(Boolean(remote));
      setMessage(
        remote
          ? text(
              "Đã tìm thấy dữ liệu đám mây. Chọn tải về hoặc lưu bản trên máy.",
              "Cloud data found. Choose to download it or save this device's copy.",
            )
          : text(
              "Chưa có bản lưu đám mây. Bạn có thể lưu dữ liệu máy này.",
              "No cloud copy yet. You can save this device's data.",
            ),
      );
    });
  return (
    <section
      className="settings-block data-settings"
      aria-labelledby="data-heading"
    >
      <div className="settings-block-heading">
        <Cloud size={22} />
        <div>
          <h3 id="data-heading">{text("Sao lưu của bạn", "Your backups")}</h3>
          <p>
            {text(
              "Giữ lại việc học, lịch sử và cài đặt của bạn.",
              "Keep your tasks, history and preferences safe.",
            )}
          </p>
        </div>
      </div>
      <div className="data-actions">
        <button
          type="button"
          className="button"
          onClick={() => {
            const blob = new Blob([exportBackup(useApp.getState())], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download =
              "focus-flow-backup-" +
              new Date().toISOString().slice(0, 10) +
              ".json";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage(text("Đã tải bản sao lưu.", "Backup downloaded."));
          }}
        >
          <Download size={18} />
          {text("Tải bản sao lưu", "Export backup")}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => input.current?.click()}
        >
          <Upload size={18} />
          {text("Khôi phục từ tệp", "Restore from file")}
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          aria-label={text("Tệp sao lưu", "Backup file")}
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              if (file.size > 10_000_000) throw new Error();
              setPending(importBackup(await file.text()));
              setMessage("");
            } catch {
              setMessage(
                text(
                  "Tệp sao lưu không hợp lệ. Dữ liệu hiện tại chưa thay đổi.",
                  "Invalid backup file. Existing data has not changed.",
                ),
              );
            }
          }}
        />
      </div>
      <p className="settings-note">
        {text(
          "Tệp chứa dữ liệu cá nhân. Chỉ nhập bản sao lưu của bạn; phiên đang chạy trong tệp sẽ được tạm dừng.",
          "The file contains personal data. Import only your own backup; a running session in the file is restored paused.",
        )}
      </p>
      {pending && (
        <div
          className="backup-confirm"
          role="group"
          aria-label={text("Xác nhận khôi phục", "Confirm restore")}
        >
          <p>
            {text("Thay dữ liệu hiện tại bằng", "Replace current data with")}{" "}
            {pending.tasks.length} {text("việc học và", "tasks and")}{" "}
            {pending.sessions.length}{" "}
            {text(
              "phiên? Hãy xuất bản sao lưu trước khi tiếp tục.",
              "sessions? Export a backup first.",
            )}
          </p>
          <div className="data-actions">
            <button
              className="button"
              type="button"
              onClick={() => setPending(null)}
            >
              {text("Hủy", "Cancel")}
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => {
                try {
                  save(pending);
                  useApp.getState().restore(pending);
                  setPending(null);
                  onRestored();
                } catch {
                  setMessage(
                    text(
                      "Không đủ bộ nhớ để khôi phục. Dữ liệu hiện tại chưa thay đổi.",
                      "Not enough storage to restore. Existing data is unchanged.",
                    ),
                  );
                }
              }}
            >
              {text("Xác nhận khôi phục", "Confirm restore")}
            </button>
          </div>
        </div>
      )}
      {cloudClient && (
        <details className="cloud-panel">
          <summary>
            {text("Đồng bộ tài khoản (tùy chọn)", "Account sync (optional)")}
          </summary>
          <h4>{text("Đồng bộ giữa thiết bị", "Sync between devices")}</h4>
          {!cloudClient ? (
            <p className="settings-note">
              {text(
                "Đồng bộ tài khoản chưa được cấu hình cho bản này. Bạn vẫn có thể chuyển dữ liệu bằng tệp sao lưu.",
                "Account sync is not configured for this deployment. You can still transfer data using backup files.",
              )}
            </p>
          ) : !account ? (
            <>
              <label className="field">
                Email
                <input
                  className="input"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button
                className="button"
                type="button"
                disabled={busy || !/^\S+@\S+\.\S+$/.test(email)}
                onClick={() =>
                  void run(async () => {
                    const { error } = await cloudClient!.auth.signInWithOtp({
                      email,
                      options: { emailRedirectTo: location.origin },
                    });
                    if (error) throw error;
                    setMessage(
                      text(
                        "Đã gửi liên kết đăng nhập. Kiểm tra email của bạn.",
                        "Sign-in link sent. Check your email.",
                      ),
                    );
                  })
                }
              >
                {busy
                  ? text("Đang gửi…", "Sending…")
                  : text("Gửi liên kết đăng nhập", "Send sign-in link")}
              </button>
              <p className="settings-note">
                {text(
                  "Đăng nhập cùng email trên các thiết bị. Mỗi tài khoản chỉ truy cập dữ liệu của mình.",
                  "Use the same email on each device. Each account can access only its own data.",
                )}
              </p>
            </>
          ) : (
            <>
              <p className="cloud-account">{account}</p>
              <div className="data-actions">
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => void inspect()}
                >
                  <RefreshCw size={16} />
                  {text("Kiểm tra bản đám mây", "Check cloud copy")}
                </button>
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await cloudClient!.auth.signOut();
                      setMessage(
                        text(
                          "Đã đăng xuất. Dữ liệu trên máy được giữ nguyên.",
                          "Signed out. Local data is retained.",
                        ),
                      );
                    })
                  }
                >
                  <LogOut size={16} />
                  {text("Đăng xuất", "Sign out")}
                </button>
              </div>
              {revision !== null && (
                <div className="data-actions">
                  <button
                    className="button"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const latest = await writeCloud(
                          portableData(useApp.getState()),
                          revision,
                        );
                        setRevision(latest);
                        setCloudExists(true);
                        setMessage(
                          text(
                            "Đã lưu dữ liệu lên tài khoản. Mở thiết bị khác để tải về.",
                            "Saved to your account. Download it on your other device.",
                          ),
                        );
                      })
                    }
                  >
                    {text(
                      "Lưu bản trên máy lên đám mây",
                      "Save this device to cloud",
                    )}
                  </button>
                  {cloudExists && (
                    <button
                      className="button"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const remote = await readCloud();
                          if (!remote) return;
                          setRevision(remote.revision);
                          setPending(
                            fromCloud(remote.payload, useApp.getState()),
                          );
                        })
                      }
                    >
                      {text("Tải bản đám mây về", "Download cloud copy")}
                    </button>
                  )}
                </div>
              )}
              <p className="settings-note">
                {text(
                  "Đồng bộ theo yêu cầu. Bấm kiểm tra trước khi lưu để tránh ghi đè dữ liệu mới từ thiết bị khác. Đồng hồ đang chạy chỉ hoạt động trên thiết bị này.",
                  "Sync is manual. Check before saving to avoid overwriting newer changes from another device. A running timer stays on this device.",
                )}
              </p>
            </>
          )}
        </details>
      )}
      {message && (
        <p className="settings-note" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
