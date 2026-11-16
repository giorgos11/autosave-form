import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { ProfileAutosave } from "../../application/create-profile-autosave";
import type { Country } from "../../domain/constants/countries";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type {
  UserProfile,
  UserProfileErrors,
  UserProfileField,
} from "../../domain/entities/user-profile";
import { suggestPhoneForCountry } from "../../domain/rules/suggest-phone-for-country";
import { validateUserProfile } from "../../domain/rules/validate-user-profile";

export type UseUserProfileViewModelParams = {
  autosave: Pick<ProfileAutosave, "schedule">;
  initialProfile?: UserProfile;
};

export const useUserProfileViewModel = ({
  autosave,
  initialProfile = INITIAL_USER_PROFILE,
}: UseUserProfileViewModelParams) => {
  const [values, setValues] = useState<UserProfile>(initialProfile);
  const [errors, setErrors] = useState<UserProfileErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<UserProfileField, boolean>>
  >({});

  const commit = (next: UserProfile) => {
    setValues(next);
    autosave.schedule(next);
  };

  const updateField = <K extends UserProfileField>(
    field: K,
    value: UserProfile[K],
  ) => {
    const next = { ...values, [field]: value };
    commit(next);
    if (touched[field]) {
      setErrors(validateUserProfile({ values: next }));
    }
  };

  const updateSkills = (
    getNextSkills: (skills: UserProfile["skills"]) => UserProfile["skills"],
  ) => {
    commit({ ...values, skills: getNextSkills(values.skills) });
  };

  const handleTextChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    if (name === "country") {
      const nextCountry = value as Country | "";
      const next = {
        ...values,
        country: nextCountry,
        phone: suggestPhoneForCountry({
          phone: values.phone,
          previousCountry: values.country,
          nextCountry,
        }),
      };
      commit(next);
      if (touched.country || touched.phone) {
        setErrors(validateUserProfile({ values: next }));
      }
      return;
    }

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

  const getVisibleError = (field: UserProfileField) => {
    return touched[field] ? errors[field] : undefined;
  };

  const replaceProfile = (profile: UserProfile) => {
    setValues(profile);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    getVisibleError,
    updateSkills,
    replaceProfile,
  };
};
