import styles from "./SaveStatus.module.css";

export type SaveStatusKind = "idle" | "saving" | "saved" | "error";

type SaveStatusProps = {
  status: SaveStatusKind;
};

const messages: Record<SaveStatusKind, string> = {
  idle: "Changes are saved automatically.",
  saving: "Saving…",
  saved: "Saved",
  error: "Error saving",
};

const tones: Record<SaveStatusKind, "neutral" | "busy" | "success" | "error"> =
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
