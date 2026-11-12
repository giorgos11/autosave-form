import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { isOlderThan } from "../../utils/isOlderThan";
import {
  createSkill,
  moveSkill,
  removeSkill,
  updateSkillName,
} from "../SkillsList/SkillsList.service";
import {
  BIO_MAX,
  EMAIL_PATTERN,
  INITIAL_VALUES,
  PHONE_PATTERN,
  type UserInfoFormErrors,
  type UserInfoFormField,
  type UserInfoFormValues,
} from "./UserInfoForm.constants";

export interface ValidateParams {
  values: UserInfoFormValues;
}

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

export const useUserInfoForm = () => {
  const [values, setValues] = useState<UserInfoFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<UserInfoFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<UserInfoFormField, boolean>>
  >({});

  const updateField = <K extends UserInfoFormField>(
    field: K,
    value: UserInfoFormValues[K],
  ) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        setErrors(validate({ values: next }));
      }
      return next;
    });
  };

  const updateSkills = (
    getNextSkills: (skills: UserInfoFormValues["skills"]) => UserInfoFormValues["skills"],
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
    updateField(name as UserInfoFormField, value as never);
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField("newsletter", event.target.checked);
  };

  const handleBlur = (field: UserInfoFormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate({ values }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const showError = (field: UserInfoFormField) => {
    return Boolean(touched[field] && errors[field]);
  };

  const handleAddSkill = () => {
    updateSkills((skills) => [...skills, createSkill()]);
  };

  const handleRemoveSkill = (id: string) => {
    updateSkills((skills) => removeSkill({ skills, id }));
  };

  const handleMoveSkillUp = (index: number) => {
    updateSkills((skills) =>
      moveSkill({ skills, fromIndex: index, toIndex: index - 1 }),
    );
  };

  const handleMoveSkillDown = (index: number) => {
    updateSkills((skills) =>
      moveSkill({ skills, fromIndex: index, toIndex: index + 1 }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    updateSkills((skills) => {
      const fromIndex = skills.findIndex((skill) => skill.id === active.id);
      const toIndex = skills.findIndex((skill) => skill.id === over.id);
      return moveSkill({ skills, fromIndex, toIndex });
    });
  };

  const handleSkillNameChange = (
    event: ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const { value } = event.target;
    updateSkills((skills) =>
      updateSkillName({ skills, id, name: value }),
    );
  };

  return {
    values,
    errors,
    handleTextChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    showError,
    handleAddSkill,
    handleRemoveSkill,
    handleMoveSkillUp,
    handleMoveSkillDown,
    handleDragEnd,
    handleSkillNameChange,
  };
};
