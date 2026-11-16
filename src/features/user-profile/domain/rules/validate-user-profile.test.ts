import { describe, expect, it } from "vitest";
import { INITIAL_USER_PROFILE } from "../constants/initial-user-profile";
import {
  BIO_MAX,
  MIN_AGE,
  MIN_FULL_NAME_LENGTH,
} from "../constants/validation";
import type { UserProfile } from "../entities/user-profile";
import { validateUserProfile } from "./validate-user-profile";

const NOW = new Date("2026-06-15T12:00:00.000Z");

const validProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  ...INITIAL_USER_PROFILE,
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "",
  country: "United Kingdom",
  bio: "Mathematician",
  dateOfBirth: "1990-01-01",
  newsletter: false,
  skills: [],
  ...overrides,
});

describe("validateUserProfile", () => {
  it("returns no errors for a valid profile", () => {
    expect(validateUserProfile({ values: validProfile(), now: NOW })).toEqual(
      {},
    );
  });

  it("requires full name, email, country and date of birth", () => {
    expect(
      validateUserProfile({ values: INITIAL_USER_PROFILE, now: NOW }),
    ).toEqual({
      fullName: "Full name is required",
      email: "Email is required",
      country: "Country is required",
      dateOfBirth: "Date of birth is required",
    });
  });

  it("rejects a full name that is too short", () => {
    const errors = validateUserProfile({
      values: validProfile({ fullName: "A" }),
      now: NOW,
    });

    expect(errors.fullName).toBe(
      `Full name must be at least ${MIN_FULL_NAME_LENGTH} characters`,
    );
  });

  it("trims full name before validating length", () => {
    const errors = validateUserProfile({
      values: validProfile({ fullName: "  A  " }),
      now: NOW,
    });

    expect(errors.fullName).toBe(
      `Full name must be at least ${MIN_FULL_NAME_LENGTH} characters`,
    );
  });

  it("rejects an invalid email", () => {
    const errors = validateUserProfile({
      values: validProfile({ email: "not-an-email" }),
      now: NOW,
    });

    expect(errors.email).toBe("Enter a valid email address");
  });

  it("allows an empty phone but rejects an invalid one", () => {
    expect(
      validateUserProfile({
        values: validProfile({ phone: "" }),
        now: NOW,
      }).phone,
    ).toBeUndefined();

    expect(
      validateUserProfile({
        values: validProfile({ phone: "abc" }),
        now: NOW,
      }).phone,
    ).toBe("Enter a valid phone number");
  });

  it("accepts a plausible phone number", () => {
    const errors = validateUserProfile({
      values: validProfile({ phone: "+1 555 123 4567" }),
      now: NOW,
    });

    expect(errors.phone).toBeUndefined();
  });

  it("rejects a bio that exceeds the max length", () => {
    const errors = validateUserProfile({
      values: validProfile({ bio: "x".repeat(BIO_MAX + 1) }),
      now: NOW,
    });

    expect(errors.bio).toBe(`Bio must be ${BIO_MAX} characters or fewer`);
  });

  it("rejects a user younger than the minimum age", () => {
    const errors = validateUserProfile({
      values: validProfile({ dateOfBirth: "2015-01-01" }),
      now: NOW,
    });

    expect(errors.dateOfBirth).toBe(
      `You must be at least ${MIN_AGE} years old`,
    );
  });

  it("accepts a user who turned the minimum age today", () => {
    const errors = validateUserProfile({
      values: validProfile({ dateOfBirth: "2008-06-15" }),
      now: NOW,
    });

    expect(errors.dateOfBirth).toBeUndefined();
  });
});
