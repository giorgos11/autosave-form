export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Greece",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Japan",
  "Brazil",
  "India",
  "Other",
] as const;

export type Country = (typeof COUNTRIES)[number];
