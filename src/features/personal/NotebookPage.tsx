import { PageTitle } from "../../components/ui";
import { useCopy } from "./copy";
import Subjects from "./Subjects";
import SessionNotebook from "./SessionNotebook";
export default function NotebookPage() {
  const copy = useCopy();
  return (
    <div className="notebook-page">
      <PageTitle
        title={copy("Sổ học của bạn", "Your study notebook")}
        subtitle={copy(
          "Ghi lại điều đã làm và điểm bắt đầu cho lần tới.",
          "Keep what you learned and where to begin next time.",
        )}
      />
      <Subjects />
      <SessionNotebook />
    </div>
  );
}
