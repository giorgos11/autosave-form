export type SaveUserProfileErrorParams = {
  message: string;
  retryable: boolean;
  conflict?: boolean;
  cause?: unknown;
};

export class SaveUserProfileError extends Error {
  readonly retryable: boolean;
  readonly conflict: boolean;

  constructor({
    message,
    retryable,
    conflict = false,
    cause,
  }: SaveUserProfileErrorParams) {
    super(message, { cause });
    this.name = "SaveUserProfileError";
    this.retryable = retryable;
    this.conflict = conflict;
  }
}

export const isRetryableSaveError = (error: unknown): boolean =>
  error instanceof SaveUserProfileError && error.retryable;

export const isConflictSaveError = (error: unknown): boolean =>
  error instanceof SaveUserProfileError && error.conflict;
