import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <p className={styles.brand}>Autosave Form</p>
        <span className={styles.avatar} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="3.25" />
            <path d="M5.5 19.25c1.6-3.1 4-4.75 6.5-4.75s4.9 1.65 6.5 4.75" />
          </svg>
        </span>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>Demo profile editor — changes autosave to a mock API.</p>
      </footer>
    </div>
  );
};
