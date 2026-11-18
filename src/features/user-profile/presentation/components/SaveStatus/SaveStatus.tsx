import { useState, useSyncExternalStore } from "react";
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

const CONFLICT_HINT =
  "Someone else updated the profile. Keep yours or use theirs.";

const USE_THEIRS_ERROR = "Couldn't load the server version. Try again.";

const describe = (
  status: AutosaveStatus,
): { tone: Tone; message: string; hint?: string } => {
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
      return { tone: "error", message: "Conflict", hint: CONFLICT_HINT };
  }
};

export const SaveStatus = ({ autosave, onUseTheirs }: SaveStatusProps) => {
  const status = useSyncExternalStore(autosave.subscribe, autosave.getStatus);
  const { tone, message, hint } = describe(status);
  const [useTheirsError, setUseTheirsError] = useState<string | null>(null);
  const [useTheirsPending, setUseTheirsPending] = useState(false);
  const showUseTheirsError = status.kind === "conflict" ? useTheirsError : null;

  const handleUseTheirs = async () => {
    if (useTheirsPending) return;

    setUseTheirsPending(true);
    setUseTheirsError(null);

    try {
      const profile = await autosave.useTheirs();
      onUseTheirs(profile);
    } catch {
      setUseTheirsError(USE_THEIRS_ERROR);
    } finally {
      setUseTheirsPending(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div
        className={styles.saveStatus}
        data-tone={tone}
        data-tooltip={hint}
        tabIndex={hint ? 0 : undefined}
        aria-label={hint ? `${message}. ${hint}` : undefined}
      >
        <span className={styles.indicator} aria-hidden="true" />
        <p role="status" className={styles.message}>
          {message}
          {status.kind === "retrying"
            ? ` ${status.attempt}/${status.maxAttempts}`
            : null}
        </p>
      </div>

      <div className={styles.actionSlot}>
        {status.kind === "error" ? (
          <button
            type="button"
            className={styles.retryButton}
            onClick={autosave.retry}
          >
            Retry
          </button>
        ) : null}

        {status.kind === "conflict" ? (
          <div className={styles.conflictActions}>
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => {
                setUseTheirsError(null);
                void autosave.keepMine();
              }}
              disabled={useTheirsPending}
            >
              Keep mine
            </button>
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => void handleUseTheirs()}
              disabled={useTheirsPending}
              aria-busy={useTheirsPending || undefined}
            >
              Use theirs
            </button>
          </div>
        ) : null}

        {showUseTheirsError ? (
          <p role="alert" className={styles.conflictError}>
            {showUseTheirsError}
          </p>
        ) : null}
      </div>
    </div>
  );
};
