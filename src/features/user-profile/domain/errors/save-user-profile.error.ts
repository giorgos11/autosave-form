export type SaveUserProfileErrorParams = {
  message: string;
  retryable: boolean;
  cause?: unknown;
};

export class SaveUserProfileError extends Error {
  readonly retryable: boolean;

  constructor({ message, retryable, cause }: SaveUserProfileErrorParams) {
    super(message, { cause });
    this.name = "SaveUserProfileError";
    this.retryable = retryable;
  }
}

export const isRetryableSaveError = (error: unknown): boolean =>
  error instanceof SaveUserProfileError && error.retryable;
