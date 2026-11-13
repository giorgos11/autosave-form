import type { Skill } from "./skill";

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  dateOfBirth: string;
  newsletter: boolean;
  skills: Skill[];
};

export type UserProfileField = Exclude<keyof UserProfile, "skills">;

export type UserProfileErrors = Partial<Record<UserProfileField, string>>;
