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
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>Demo profile editor — changes autosave to a mock API.</p>
      </footer>
    </div>
  );
};
