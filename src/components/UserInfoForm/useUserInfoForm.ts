import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  createSkill,
  moveSkill,
  removeSkill,
  updateSkillName,
} from "../SkillsList/SkillsList.service";
import { INITIAL_VALUES } from "./UserInfoForm.constants";
import { validate } from "./UserInfoForm.service";
import type {
  UserInfoFormErrors,
  UserInfoFormField,
  UserInfoFormValues,
} from "./UserInfoForm.types";

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
    getNextSkills: (
      skills: UserInfoFormValues["skills"],
    ) => UserInfoFormValues["skills"],
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
    updateSkills((skills) => updateSkillName({ skills, id, name: value }));
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
