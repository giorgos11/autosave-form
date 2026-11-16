import { COUNTRIES } from "../../domain/constants/countries";
import type { UserProfile } from "../../domain/entities/user-profile";
import type { UserProfileDto } from "./user-profile.dto";

export const toUserProfileDto = (profile: UserProfile): UserProfileDto => ({
  fullName: profile.fullName,
  email: profile.email,
  phone: profile.phone,
  country: profile.country,
  bio: profile.bio,
  dateOfBirth: profile.dateOfBirth,
  newsletter: profile.newsletter,
  skills: profile.skills.map(({ id, name }) => ({ id, name })),
});

const toCountry = (value: string): UserProfile["country"] => {
  if (value === "") return "";
  return (COUNTRIES as readonly string[]).includes(value)
    ? (value as UserProfile["country"])
    : "";
};

export const toUserProfile = (dto: UserProfileDto): UserProfile => ({
  fullName: dto.fullName,
  email: dto.email,
  phone: dto.phone,
  country: toCountry(dto.country),
  bio: dto.bio,
  dateOfBirth: dto.dateOfBirth,
  newsletter: dto.newsletter,
  skills: dto.skills.map(({ id, name }) => ({ id, name })),
});
