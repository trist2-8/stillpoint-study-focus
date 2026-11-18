import { create } from "zustand";
import miniStyles from "./mini-timer.css?inline";
interface PictureWindow extends Window {
  documentPictureInPicture?: {
    requestWindow: (options: {
      width: number;
      height: number;
    }) => Promise<Window>;
  };
}
type MiniStatus =
  "closed" | "opening" | "native" | "popup" | "blocked" | "unavailable";
export const useMiniWindow = create<{
  popup: Window | null;
  status: MiniStatus;
}>(() => ({ popup: null, status: "closed" }));
let requestVersion = 0;
export function closeFloatingTimer() {
  requestVersion++;
  useMiniWindow.getState().popup?.close();
  useMiniWindow.setState({ popup: null, status: "closed" });
}
export async function requestFloatingTimer(ordinary = false) {
  const state = useMiniWindow.getState();
  if (state.popup && !state.popup.closed) {
    state.popup.focus();
    return;
  }
  if (state.status === "opening") return;
  const version = ++requestVersion;
  useMiniWindow.setState({ status: "opening", popup: null });
  let child: Window | null = null;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const api = (window as PictureWindow).documentPictureInPicture;
    if (api && !ordinary) {
      const request = api.requestWindow({ width: 280, height: 160 });
      request
        .then((window) => {
          if (version !== requestVersion) window.close();
        })
        .catch(() => undefined);
      child = await Promise.race([
        request,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("timeout")), 3500);
        }),
      ]);
    } else
      child = window.open("", "focus-flow-timer", "popup,width=280,height=160");
    if (!child || child.closed) throw new Error("blocked");
    if (version !== requestVersion) {
      child.close();
      return;
    }
    const base = child.document.createElement("base");
    base.href = location.origin + "/";
    child.document.head.appendChild(base);
    const style = child.document.createElement("style");
    style.textContent = miniStyles;
    child.document.head.appendChild(style);
    child.addEventListener(
      "pagehide",
      () => {
        if (useMiniWindow.getState().popup === child)
          useMiniWindow.setState({ popup: null, status: "closed" });
      },
      { once: true },
    );
    useMiniWindow.setState({
      popup: child,
      status: api && !ordinary ? "native" : "popup",
    });
  } catch {
    if (version === requestVersion) {
      requestVersion++;
      child?.close();
      useMiniWindow.setState({
        popup: null,
        status:
          ordinary || !(window as PictureWindow).documentPictureInPicture
            ? "blocked"
            : "unavailable",
      });
    }
  } finally {
    clearTimeout(timeout);
  }
}
