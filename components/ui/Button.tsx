import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "light";

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type LinkProps = CommonProps & { href: string; onClick?: never } & { "aria-label"?: string };
type NativeProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/** Full-width pill button. Renders a Next <Link> when `href` is given. */
export default function Button(props: LinkProps | NativeProps) {
  const { variant = "primary", children, className = "" } = props;
  const cls = `${styles.btn} ${styles[variant]} ${className}`;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} aria-label={props["aria-label"]}>
        {children}
      </Link>
    );
  }

  const { variant: _v, children: _c, className: _cn, href: _h, ...rest } = props;
  void _v; void _c; void _cn; void _h;
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
