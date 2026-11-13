import type { UserProfile } from "../domain/entities/user-profile";
import type { UserProfileRepository } from "../domain/ports/user-profile.repository";

export type SaveUserProfile = (profile: UserProfile) => Promise<void>;

export type CreateSaveUserProfileParams = {
  repository: UserProfileRepository;
};

export const createSaveUserProfile = ({
  repository,
}: CreateSaveUserProfileParams): SaveUserProfile => {
  return (profile) => repository.save(profile);
};
