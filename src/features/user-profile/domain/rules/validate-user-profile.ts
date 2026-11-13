import { isAtLeastAge } from "@/shared/lib/is-at-least-age";
import {
  BIO_MAX,
  EMAIL_PATTERN,
  MIN_AGE,
  MIN_FULL_NAME_LENGTH,
  PHONE_PATTERN,
} from "../constants/validation";
import type { UserProfile, UserProfileErrors } from "../entities/user-profile";

export type ValidateUserProfileParams = {
  values: UserProfile;
  now?: Date;
};

export const validateUserProfile = ({
  values,
  now = new Date(),
}: ValidateUserProfileParams): UserProfileErrors => {
  const errors: UserProfileErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (values.fullName.trim().length < MIN_FULL_NAME_LENGTH) {
    errors.fullName = `Full name must be at least ${MIN_FULL_NAME_LENGTH} characters`;
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }

  if (!values.country) {
    errors.country = "Country is required";
  }

  if (values.bio.length > BIO_MAX) {
    errors.bio = `Bio must be ${BIO_MAX} characters or fewer`;
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else if (
    !isAtLeastAge({ dateOfBirth: values.dateOfBirth, age: MIN_AGE, now })
  ) {
    errors.dateOfBirth = `You must be at least ${MIN_AGE} years old`;
  }

  return errors;
};
