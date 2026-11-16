import type { UserProfile } from "../domain/entities/user-profile";
import type { UserProfileRepository } from "../domain/ports/user-profile.repository";

export type GetUserProfile = () => Promise<UserProfile>;

export type CreateGetUserProfileParams = {
  repository: UserProfileRepository;
};

export const createGetUserProfile = ({
  repository,
}: CreateGetUserProfileParams): GetUserProfile => {
  return () => repository.get();
};
