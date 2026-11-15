import styles from "./AutosaveActiveBadge.module.css";

/** Standing cue that autosave is enabled — not a live save-state announcer. */
export const AutosaveActiveBadge = () => {
  return (
    <div className={styles.badge} aria-hidden="true">
      <span className={styles.pulse} />
      <span className={styles.label}>Autosave active</span>
    </div>
  );
};
