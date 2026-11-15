import { describe, expect, it } from "vitest";
import { isAtLeastAge } from "./is-at-least-age";

const NOW = new Date(2026, 5, 15); // 15 June 2026 (local)

describe("isAtLeastAge", () => {
  it("returns false for a non ISO date", () => {
    expect(
      isAtLeastAge({ dateOfBirth: "15/06/2000", age: 18, now: NOW }),
    ).toBe(false);
  });

  it("returns false for an impossible calendar date", () => {
    expect(
      isAtLeastAge({ dateOfBirth: "2020-02-30", age: 18, now: NOW }),
    ).toBe(false);
  });

  it("returns true when the birthday has already occurred this year", () => {
    expect(
      isAtLeastAge({ dateOfBirth: "2008-06-15", age: 18, now: NOW }),
    ).toBe(true);
  });

  it("returns false when the birthday has not occurred yet this year", () => {
    expect(
      isAtLeastAge({ dateOfBirth: "2008-06-16", age: 18, now: NOW }),
    ).toBe(false);
  });

  it("returns false when younger than the required age", () => {
    expect(
      isAtLeastAge({ dateOfBirth: "2010-01-01", age: 18, now: NOW }),
    ).toBe(false);
  });
});
