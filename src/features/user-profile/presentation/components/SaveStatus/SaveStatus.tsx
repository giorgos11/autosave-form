import { useSyncExternalStore } from "react";
import type {
  AutosaveStatus,
  ProfileAutosave,
} from "../../../application/create-profile-autosave";
import type { UserProfile } from "../../../domain/entities/user-profile";
import styles from "./SaveStatus.module.css";

type SaveStatusProps = {
  autosave: Pick<
    ProfileAutosave,
    "subscribe" | "getStatus" | "retry" | "keepMine" | "useTheirs"
  >;
  onUseTheirs: (profile: UserProfile) => void;
};

type Tone = "neutral" | "busy" | "success" | "error";

const CONFLICT_DETAIL =
  "Someone else saved while you were editing. Keep yours or load theirs.";

const describe = (
  status: AutosaveStatus,
): { tone: Tone; message: string; detail?: string } => {
  switch (status.kind) {
    case "idle":
      return { tone: "neutral", message: "Autosave on" };
    case "saving":
      return { tone: "busy", message: "Saving…" };
    case "saved":
      return { tone: "success", message: "Saved" };
    case "retrying":
    case "error":
      return { tone: "error", message: "Error saving" };
    case "conflict":
      return { tone: "error", message: "Conflict", detail: CONFLICT_DETAIL };
  }
};

export const SaveStatus = ({ autosave, onUseTheirs }: SaveStatusProps) => {
  const status = useSyncExternalStore(autosave.subscribe, autosave.getStatus);
  const { tone, message, detail } = describe(status);

  const handleUseTheirs = async () => {
    const profile = await autosave.useTheirs();
    onUseTheirs(profile);
  };

  return (
    <div className={styles.cluster}>
      <div
        className={styles.saveStatus}
        data-tone={tone}
        title={detail}
        aria-label={detail ? `${message}. ${detail}` : undefined}
      >
        <span className={styles.indicator} aria-hidden="true" />
        <p role="status" className={styles.message}>
          {message}
          {status.kind === "retrying"
            ? ` ${status.attempt}/${status.maxAttempts}`
            : null}
        </p>
      </div>
      {status.kind === "error" && (
        <button
          type="button"
          className={styles.retryButton}
          onClick={autosave.retry}
        >
          Retry
        </button>
      )}
      {status.kind === "conflict" && (
        <div className={styles.conflictActions}>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => void autosave.keepMine()}
          >
            Keep mine
          </button>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => void handleUseTheirs()}
          >
            Use theirs
          </button>
        </div>
      )}
    </div>
  );
};
