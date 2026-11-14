import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type {
  UserProfile,
  UserProfileErrors,
  UserProfileField,
} from "../../domain/entities/user-profile";
import { validateUserProfile } from "../../domain/rules/validate-user-profile";
import type { SaveStatusKind } from "../components/SaveStatus/SaveStatus";
import { useUserProfileDependencies } from "../providers/user-profile-dependencies.context";

const SAVE_DEBOUNCE_MS = 500;

export const useUserProfileViewModel = () => {
  const { save } = useUserProfileDependencies();
  const [values, setValues] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [errors, setErrors] = useState<UserProfileErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<UserProfileField, boolean>>
  >({});
  const [saveStatus, setSaveStatus] = useState<SaveStatusKind>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  const commit = (next: UserProfile) => {
    setValues(next);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      save(next)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, SAVE_DEBOUNCE_MS);
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
