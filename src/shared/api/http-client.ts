import { HttpError } from "./http-error";

type RequestOptions = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export type HttpClient = {
  get: <TResponse>(
    path: string,
    options?: RequestOptions,
  ) => Promise<TResponse>;
  post: <TResponse>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ) => Promise<TResponse>;
  put: <TResponse>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ) => Promise<TResponse>;
  delete: <TResponse>(
    path: string,
    options?: RequestOptions,
  ) => Promise<TResponse>;
};

export type CreateHttpClientParams = {
  baseUrl: string;
};

export const createHttpClient = ({
  baseUrl,
}: CreateHttpClientParams): HttpClient => {
  const request = async <TResponse>(
    method: string,
    path: string,
    body: unknown,
    { signal, headers }: RequestOptions = {},
  ): Promise<TResponse> => {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new HttpError({
        status: response.status,
        url,
        message: `${method} ${url} failed with ${response.status}`,
      });
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  };

  return {
    get: (path, options) => request("GET", path, undefined, options),
    post: (path, body, options) => request("POST", path, body, options),
    put: (path, body, options) => request("PUT", path, body, options),
    delete: (path, options) => request("DELETE", path, undefined, options),
  };
};
