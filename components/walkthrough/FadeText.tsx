import { Fragment } from "react";
import styles from "./FadeText.module.css";

interface Props {
  text: string;
  className?: string;
}

/**
 * Renders text split into per-letter spans (`data-char`) so GSAP can fade the colour from
 * letter to letter. Words stay unbroken so line wrapping is the same as plain text, and
 * the full sentence is exposed to assistive tech once via the visually hidden copy.
 */
export default function FadeText({ text, className }: Props) {
  const words = text.split(" ");
  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className={styles.word}>
              {[...word].map((char, c) => (
                <span key={c} data-char className={styles.char}>
                  {char}
                </span>
              ))}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </p>
  );
}
