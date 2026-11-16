import { describe, expect, it } from "vitest";
import { toLocalIsoDate } from "./to-local-iso-date";

describe("toLocalIsoDate", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toLocalIsoDate(new Date(2026, 5, 15))).toBe("2026-06-15");
  });

  it("pads month and day", () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
