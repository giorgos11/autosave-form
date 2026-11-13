import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type {
  UserProfile,
  UserProfileErrors,
  UserProfileField,
} from "../../domain/entities/user-profile";
import {
  createSkill,
  moveSkill,
  removeSkill,
  updateSkillName,
} from "../../domain/rules/skills";
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
