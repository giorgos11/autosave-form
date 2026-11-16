import type { Country } from "./countries";

export const COUNTRY_DIAL_CODES: Record<Country, string | null> = {
  "United States": "+1",
  "United Kingdom": "+44",
  Canada: "+1",
  Australia: "+61",
  Germany: "+49",
  France: "+33",
  Greece: "+30",
  Spain: "+34",
  Italy: "+39",
  Netherlands: "+31",
  Sweden: "+46",
  Japan: "+81",
  Brazil: "+55",
  India: "+91",
  Other: null,
};

export const dialCodeForCountry = (country: Country | ""): string | null => {
  if (!country) return null;
  return COUNTRY_DIAL_CODES[country];
};

export const phonePlaceholderForCountry = (country: Country | ""): string => {
  const dialCode = dialCodeForCountry(country);
  if (!dialCode) return "+1 555 123 4567";
  return `${dialCode} …`;
};
