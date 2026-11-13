import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type {
  UserProfile,
  UserProfileErrors,
  UserProfileField,
} from "../../domain/entities/user-profile";
import { validateUserProfile } from "../../domain/rules/validate-user-profile";
export const useUserProfileViewModel = () => {
  const [values, setValues] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [errors, setErrors] = useState<UserProfileErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<UserProfileField, boolean>>
  >({});

  const updateField = <K extends UserProfileField>(
    field: K,
    value: UserProfile[K],
  ) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        setErrors(validateUserProfile({ values: next }));
      }
      return next;
    });
  };

  const updateSkills = (
    getNextSkills: (skills: UserProfile["skills"]) => UserProfile["skills"],
  ) => {
    setValues((prev) => ({
      ...prev,
      skills: getNextSkills(prev.skills),
    }));
  };

  const handleTextChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    updateField(name as UserProfileField, value as never);
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField("newsletter", event.target.checked);
  };

  const handleBlur = (field: UserProfileField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateUserProfile({ values }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const showError = (field: UserProfileField) => {
    return Boolean(touched[field] && errors[field]);
  };

  return {
    values,
    errors,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    showError,
    updateSkills,
  };
};
