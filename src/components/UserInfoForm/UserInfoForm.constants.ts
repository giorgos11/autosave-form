import type { UserInfoFormValues } from "./UserInfoForm.types";

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

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;
export const BIO_MAX = 500;

export const INITIAL_VALUES: UserInfoFormValues = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  bio: "",
  dateOfBirth: "",
  newsletter: false,
  skills: [],
};
