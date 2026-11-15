import { beforeAll, afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TaskForm } from "./TaskForm";
import { useApp } from "../../stores/app-store";
beforeAll(() => {
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
});
afterEach(cleanup);
it("validates whitespace titles and saves a valid task", () => {
  const close = vi.fn();
  render(<TaskForm task={null} onClose={close} />);
  fireEvent.change(screen.getByLabelText("Tên việc học"), {
    target: { value: "   " },
  });
  fireEvent.submit(screen.getByText("Tạo việc học").closest("form")!);
  expect(screen.getByRole("alert")).toHaveTextContent("Hãy nhập tên việc học");
  fireEvent.change(screen.getByLabelText("Tên việc học"), {
    target: { value: "Read biology" },
  });
  fireEvent.submit(screen.getByText("Tạo việc học").closest("form")!);
  expect(useApp.getState().tasks.some((t) => t.title === "Read biology")).toBe(
    true,
  );
  expect(close).toHaveBeenCalledOnce();
});
