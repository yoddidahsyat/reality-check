import type { ReactNode } from "react";
import PersistentCube from "./PersistentCube";
import styles from "./AppFrame.module.css";

/** Wraps every screen and adds the persistent cube layer next to the page content. */
export default function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      {children}
      <PersistentCube />
    </div>
  );
}
