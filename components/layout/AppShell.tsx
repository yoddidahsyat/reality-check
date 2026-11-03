import type { ReactNode } from "react";
import Header from "./Header";
import styles from "./AppShell.module.css";

interface Props {
  children: ReactNode;
  /** Show the back arrow. Pass `onBack` to override history navigation. */
  showBack?: boolean;
  onBack?: () => void;
}

/** Mobile-width column with the dark gradient background and shared header. */
export default function AppShell({ children, showBack = true, onBack }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Header showBack={showBack} onBack={onBack} />
        <main id="main" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
