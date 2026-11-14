import type { AutosaveStatus } from "../../../application/create-profile-autosave";
import styles from "./SaveStatus.module.css";

type SaveStatusProps = {
  status: AutosaveStatus;
};

const messages: Record<AutosaveStatus, string> = {
  idle: "Changes are saved automatically.",
  saving: "Saving…",
  saved: "Saved",
  error: "Error saving",
};

const tones: Record<AutosaveStatus, "neutral" | "busy" | "success" | "error"> =
  {
    idle: "neutral",
    saving: "busy",
    saved: "success",
    error: "error",
  };

export const SaveStatus = ({ status }: SaveStatusProps) => {
  return (
    <div className={styles.saveStatus} data-tone={tones[status]}>
      <span className={styles.indicator} aria-hidden="true" />
      <p role="status" className={styles.message}>
        {messages[status]}
      </p>
    </div>
  );
};
