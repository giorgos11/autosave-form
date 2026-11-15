/// <reference types="vite/client" />
/// <reference types="msw/vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_MOCKS?: "true" | "false";
  readonly VITE_MOCK_ERROR_RATE?: string;
  readonly VITE_MOCK_LATENCY_MIN_MS?: string;
  readonly VITE_MOCK_LATENCY_MAX_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
