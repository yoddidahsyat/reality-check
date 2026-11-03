import styles from "./Dots.module.css";

interface Props {
  count: number;
  active: number;
  className?: string;
}

/** Pagination dots; announced as "Step X of N" for assistive tech. */
export default function Dots({ count, active, className = "" }: Props) {
  return (
    <div className={`${styles.dots} ${className}`} role="status" aria-live="polite">
      <span className="sr-only">
        Step {active + 1} of {count}
      </span>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden="true" className={`${styles.dot} ${i === active ? styles.active : ""}`} />
      ))}
    </div>
  );
}
