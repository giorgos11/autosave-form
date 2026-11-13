export type MockConfig = {
  errorRate: number;
  latencyMinMs: number;
  latencyMaxMs: number;
};

const DEFAULT_MOCK_CONFIG: MockConfig = {
  errorRate: 0.2,
  latencyMinMs: 300,
  latencyMaxMs: 800,
};

const parseNumber = (value: string | null | undefined): number | undefined => {
  if (value == null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getMockConfig = (): MockConfig => {
  const query = new URLSearchParams(window.location.search);

  const errorRate =
    parseNumber(query.get("mockErrorRate")) ??
    parseNumber(import.meta.env.VITE_MOCK_ERROR_RATE) ??
    DEFAULT_MOCK_CONFIG.errorRate;

  const latencyMinMs =
    parseNumber(query.get("mockLatencyMinMs")) ??
    parseNumber(import.meta.env.VITE_MOCK_LATENCY_MIN_MS) ??
    DEFAULT_MOCK_CONFIG.latencyMinMs;

  const latencyMaxMs =
    parseNumber(query.get("mockLatencyMaxMs")) ??
    parseNumber(import.meta.env.VITE_MOCK_LATENCY_MAX_MS) ??
    DEFAULT_MOCK_CONFIG.latencyMaxMs;

  return {
    errorRate: clamp(errorRate, 0, 1),
    latencyMinMs: Math.max(0, Math.min(latencyMinMs, latencyMaxMs)),
    latencyMaxMs: Math.max(0, latencyMinMs, latencyMaxMs),
  };
};
