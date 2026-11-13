import type { Country } from "../constants/countries";
import type { Skill } from "./skill";

export type UserProfile = {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly country: Country | "";
  readonly bio: string;
  readonly dateOfBirth: string;
  readonly newsletter: boolean;
  readonly skills: readonly Skill[];
};

export type UserProfileField = Exclude<keyof UserProfile, "skills">;

export type UserProfileErrors = Partial<Record<UserProfileField, string>>;
