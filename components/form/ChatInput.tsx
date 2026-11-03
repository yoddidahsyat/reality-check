"use client";

import { useEffect, useId, useRef, type ComponentProps } from "react";
import styles from "./ChatInput.module.css";

interface Props extends Omit<ComponentProps<"input">, "onChange" | "value" | "id"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  /** The current value passes validation: the submit button turns white. */
  valid?: boolean;
  /** Focus the field on mount. */
  autoFocusField?: boolean;
}

/**
 * Chat-style text field with a circular submit arrow.
 * Label is visually hidden (the design shows it as placeholder) but present for AT.
 * Must be rendered inside a <form>.
 */
export default function ChatInput({ label, value, onChange, error, valid = false, autoFocusField, ...rest }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusField) ref.current?.focus();
  }, [autoFocusField]);

  return (
    <div className={styles.field}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className={`${styles.box} ${error ? styles.invalid : ""}`}>
        <input
          {...rest}
          ref={ref}
          id={id}
          className={styles.input}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          required
        />
        <button type="submit" className={styles.send} data-valid={valid} aria-label="Submit">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 12V2M7 2L2.5 6.5M7 2l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p id={errorId} role="alert" className={styles.error}>
        {error ?? ""}
      </p>
    </div>
  );
}
