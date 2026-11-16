import type { UserProfileDocument } from "../domain/entities/user-profile-document";
import type { UserProfileRepository } from "../domain/ports/user-profile.repository";

export type GetUserProfile = () => Promise<UserProfileDocument>;

export type CreateGetUserProfileParams = {
  repository: UserProfileRepository;
};

export const createGetUserProfile = ({
  repository,
}: CreateGetUserProfileParams): GetUserProfile => {
  return () => repository.get();
};
