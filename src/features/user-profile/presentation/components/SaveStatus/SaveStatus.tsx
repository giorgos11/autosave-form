import { useSyncExternalStore } from "react";
import type {
  AutosaveStatus,
  ProfileAutosave,
} from "../../../application/create-profile-autosave";
import styles from "./SaveStatus.module.css";

type SaveStatusProps = {
  autosave: Pick<ProfileAutosave, "subscribe" | "getStatus">;
};

type Tone = "neutral" | "busy" | "success" | "error";

const describe = (
  status: AutosaveStatus,
): { tone: Tone; message: string } => {
  switch (status.kind) {
    case "idle":
      return { tone: "neutral", message: "Changes are saved automatically." };
    case "saving":
      return { tone: "busy", message: "Saving…" };
    case "saved":
      return { tone: "success", message: "Saved" };
    case "retrying":
      return {
        tone: "error",
        message: `Couldn't save. Retrying (${status.attempt}/${status.maxAttempts})…`,
      };
    case "error":
      return { tone: "error", message: "Error saving" };
  }
};

export const SaveStatus = ({ autosave }: SaveStatusProps) => {
  const status = useSyncExternalStore(autosave.subscribe, autosave.getStatus);
  const { tone, message } = describe(status);

  return (
    <div className={styles.saveStatus} data-tone={tone}>
      <span className={styles.indicator} aria-hidden="true" />
      <p role="status" className={styles.message}>
        {message}
      </p>
    </div>
  );
};
