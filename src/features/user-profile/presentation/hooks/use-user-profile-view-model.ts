import {
  useEffect,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import {
  createProfileAutosave,
  type AutosaveStatus,
} from "../../application/create-profile-autosave";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type {
  UserProfile,
  UserProfileErrors,
  UserProfileField,
} from "../../domain/entities/user-profile";
import { validateUserProfile } from "../../domain/rules/validate-user-profile";
import { useUserProfileDependencies } from "../providers/user-profile-dependencies.context";

export const useUserProfileViewModel = () => {
  const { save } = useUserProfileDependencies();
  const [values, setValues] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [errors, setErrors] = useState<UserProfileErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<UserProfileField, boolean>>
  >({});
  const [autosave] = useState(() => createProfileAutosave({ save }));
  const [saveStatus, setSaveStatus] = useState<AutosaveStatus>(() =>
    autosave.getStatus(),
  );

  useEffect(() => {
    const unsubscribe = autosave.subscribe(() => {
      setSaveStatus(autosave.getStatus());
    });

    return () => {
      unsubscribe();
      autosave.dispose();
    };
  }, [autosave]);

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

  return {
    values,
    saveStatus,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    getVisibleError,
    updateSkills,
  };
};
