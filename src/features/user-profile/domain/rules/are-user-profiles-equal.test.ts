import { describe, expect, it } from "vitest";
import { INITIAL_USER_PROFILE } from "../constants/initial-user-profile";
import type { UserProfile } from "../entities/user-profile";
import { areUserProfilesEqual } from "./are-user-profiles-equal";

const profile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  ...INITIAL_USER_PROFILE,
  ...overrides,
});

describe("areUserProfilesEqual", () => {
  it("returns true for identical profiles", () => {
    const value = profile({
      fullName: "Ada",
      skills: [{ id: "1", name: "TS" }],
    });
    expect(areUserProfilesEqual(value, { ...value })).toBe(true);
  });

  it("returns false when a field differs", () => {
    expect(
      areUserProfilesEqual(
        profile({ fullName: "Ada" }),
        profile({ fullName: "Grace" }),
      ),
    ).toBe(false);
  });

  it("compares skills by id and name order", () => {
    expect(
      areUserProfilesEqual(
        profile({ skills: [{ id: "1", name: "TS" }] }),
        profile({ skills: [{ id: "1", name: "JS" }] }),
      ),
    ).toBe(false);
  });
});
