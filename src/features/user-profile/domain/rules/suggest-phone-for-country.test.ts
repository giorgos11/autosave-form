import { describe, expect, it } from "vitest";
import { suggestPhoneForCountry } from "./suggest-phone-for-country";

describe("suggestPhoneForCountry", () => {
  it("fills an empty phone with the next country's dial code", () => {
    expect(
      suggestPhoneForCountry({
        phone: "",
        previousCountry: "",
        nextCountry: "Greece",
      }),
    ).toBe("+30");
  });

  it("clears a suggested prefix when switching to Other", () => {
    expect(
      suggestPhoneForCountry({
        phone: "+30",
        previousCountry: "Greece",
        nextCountry: "Other",
      }),
    ).toBe("");
  });

  it("replaces a previous dial-code-only value", () => {
    expect(
      suggestPhoneForCountry({
        phone: "+30",
        previousCountry: "Greece",
        nextCountry: "Germany",
      }),
    ).toBe("+49");
  });

  it("does not overwrite a number the user already typed", () => {
    expect(
      suggestPhoneForCountry({
        phone: "+30 698 123 4567",
        previousCountry: "Greece",
        nextCountry: "Germany",
      }),
    ).toBe("+30 698 123 4567");
  });

  it("treats whitespace-only differences as dial-code-only", () => {
    expect(
      suggestPhoneForCountry({
        phone: "+44 ",
        previousCountry: "United Kingdom",
        nextCountry: "France",
      }),
    ).toBe("+33");
  });
});
