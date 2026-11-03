import Image from "next/image";
import styles from "./IconButton.module.css";

interface Props {
  label: string;
  icon: string;
  onClick: () => void;
}

/** Circular icon-only button; `label` provides the accessible name. */
export default function IconButton({ label, icon, onClick }: Props) {
  return (
    <button type="button" className={styles.btn} aria-label={label} onClick={onClick}>
      <Image src={icon} alt="" width={20} height={20} aria-hidden="true" />
    </button>
  );
}
