import type { Country } from "../constants/countries";
import {
  COUNTRY_DIAL_CODES,
  dialCodeForCountry,
} from "../constants/country-dial-codes";

const knownDialCodes = new Set(
  Object.values(COUNTRY_DIAL_CODES).filter((code): code is string =>
    Boolean(code),
  ),
);

const normalizePrefix = (value: string) => value.replace(/\s+/g, "");

const isOnlyDialCode = (phone: string, dialCode: string) =>
  normalizePrefix(phone) === normalizePrefix(dialCode);

const isOnlyKnownDialCode = (phone: string) => {
  const normalized = normalizePrefix(phone);
  for (const code of knownDialCodes) {
    if (normalized === normalizePrefix(code)) return true;
  }
  return false;
};

export type SuggestPhoneForCountryParams = {
  phone: string;
  previousCountry: Country | "";
  nextCountry: Country | "";
};

export const suggestPhoneForCountry = ({
  phone,
  previousCountry,
  nextCountry,
}: SuggestPhoneForCountryParams): string => {
  const nextDialCode = dialCodeForCountry(nextCountry);
  const previousDialCode = dialCodeForCountry(previousCountry);
  const trimmed = phone.trim();

  if (!trimmed) {
    return nextDialCode ?? "";
  }

  if (previousDialCode && isOnlyDialCode(trimmed, previousDialCode)) {
    return nextDialCode ?? "";
  }

  if (isOnlyKnownDialCode(trimmed)) {
    return nextDialCode ?? "";
  }

  return phone;
};
