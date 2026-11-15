import type { ReactNode } from "react";
import styles from "./FormField.module.css";

export type FormFieldControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: (controlProps: FormFieldControlProps) => ReactNode;
};

export const FormField = ({
  id,
  label,
  required = false,
  hint,
  error,
  children,
}: FormFieldProps) => {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hasHint = hint !== undefined;
  const hasError = error !== undefined;
  const describedBy = [hasHint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
        {hasHint && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )}
      </label>
      {children({
        id,
        "aria-invalid": hasError,
        "aria-describedby": describedBy || undefined,
      })}
      <p
        id={errorId}
        className={styles.error}
        role={hasError ? "alert" : undefined}
        aria-hidden={hasError ? undefined : true}
      >
        {error ?? ""}
      </p>
    </div>
  );
};
