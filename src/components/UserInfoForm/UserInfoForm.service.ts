import { isOlderThan } from "../../utils/isOlderThan";
import {
  BIO_MAX,
  EMAIL_PATTERN,
  PHONE_PATTERN,
} from "./UserInfoForm.constants";
import type {
  UserInfoFormErrors,
  UserInfoFormValues,
} from "./UserInfoForm.types";

export type ValidateParams = {
  values: UserInfoFormValues;
};

export const validate = ({ values }: ValidateParams): UserInfoFormErrors => {
  const errors: UserInfoFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
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
  } else if (!isOlderThan({ dateOfBirth: values.dateOfBirth, age: 18 })) {
    errors.dateOfBirth = "You must be at least 18 years old";
  }

  return errors;
};
