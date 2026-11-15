export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor({
    status,
    url,
    message,
  }: {
    status: number;
    url: string;
    message: string;
  }) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

export const isHttpError = (error: unknown): error is HttpError =>
  error instanceof HttpError;
