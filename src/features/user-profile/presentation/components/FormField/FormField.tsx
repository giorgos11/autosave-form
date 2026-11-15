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
  const errorId = `${id}-error`;
  const hasError = error !== undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
        {hint !== undefined && <span className={styles.hint}>{hint}</span>}
      </label>
      {children({
        id,
        "aria-invalid": hasError,
        "aria-describedby": hasError ? errorId : undefined,
      })}
      {hasError && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
