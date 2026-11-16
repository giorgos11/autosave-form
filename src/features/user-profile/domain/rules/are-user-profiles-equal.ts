import type { UserProfile } from "../entities/user-profile";

export const areUserProfilesEqual = (
  previous: UserProfile,
  next: UserProfile,
): boolean => {
  if (previous === next) return true;

  if (
    previous.fullName !== next.fullName ||
    previous.email !== next.email ||
    previous.phone !== next.phone ||
    previous.country !== next.country ||
    previous.bio !== next.bio ||
    previous.dateOfBirth !== next.dateOfBirth ||
    previous.newsletter !== next.newsletter ||
    previous.skills.length !== next.skills.length
  ) {
    return false;
  }

  return previous.skills.every(
    (skill, index) =>
      skill.id === next.skills[index]?.id &&
      skill.name === next.skills[index]?.name,
  );
};
