import { useSyncExternalStore } from "react";
import type { ProfileAutosave } from "../../../application/create-profile-autosave";
import styles from "./SaveStatus.module.css";

type SaveStatusProps = {
  autosave: Pick<ProfileAutosave, "subscribe" | "getStatus">;
};

const messages = {
  idle: "Changes are saved automatically.",
  saving: "Saving…",
  saved: "Saved",
  error: "Error saving",
} as const;

const tones = {
  idle: "neutral",
  saving: "busy",
  saved: "success",
  error: "error",
} as const;

export const SaveStatus = ({ autosave }: SaveStatusProps) => {
  const status = useSyncExternalStore(autosave.subscribe, autosave.getStatus);

  return (
    <div className={styles.saveStatus} data-tone={tones[status]}>
      <span className={styles.indicator} aria-hidden="true" />
      <p role="status" className={styles.message}>
        {messages[status]}
      </p>
    </div>
  );
};
