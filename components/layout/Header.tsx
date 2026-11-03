"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import IconButton from "@/components/ui/IconButton";
import { useFormData } from "@/context/FormContext";
import styles from "./Header.module.css";

interface Props {
  showBack: boolean;
  onBack?: () => void;
}

export default function Header({ showBack, onBack }: Props) {
  const router = useRouter();
  const { restart } = useFormData();

  return (
    <header className={styles.header}>
      {showBack ? (
        <IconButton label="Go back" icon="/images/arrow-left.svg" onClick={onBack ?? (() => router.back())} />
      ) : (
        <span className={styles.spacer} aria-hidden="true" />
      )}
      <Image src="/images/logo.svg" alt="Juicebox" width={123} height={29} priority className={styles.logo} />
      <IconButton
        label="Start over"
        icon="/images/refresh.svg"
        onClick={() => {
          // Clears data and tells Home to replay its intro from blank (no page reload)
          restart();
          router.push("/");
        }}
      />
    </header>
  );
}
