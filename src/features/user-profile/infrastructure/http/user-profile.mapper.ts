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
