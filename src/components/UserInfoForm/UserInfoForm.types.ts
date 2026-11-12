import type { Skill } from "../SkillsList/SkillsList.types";

export type UserInfoFormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  dateOfBirth: string;
  newsletter: boolean;
  skills: Skill[];
};

export type UserInfoFormField = Exclude<keyof UserInfoFormValues, "skills">;

export type UserInfoFormErrors = Partial<Record<UserInfoFormField, string>>;
