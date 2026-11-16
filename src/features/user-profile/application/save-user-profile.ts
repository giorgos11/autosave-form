import type { UserProfile } from "../domain/entities/user-profile";
import type {
  SaveUserProfileResult,
  UserProfileRepository,
} from "../domain/ports/user-profile.repository";

export type SaveUserProfile = (params: {
  profile: UserProfile;
  revision: number;
}) => Promise<SaveUserProfileResult>;

export type CreateSaveUserProfileParams = {
  repository: UserProfileRepository;
};

export const createSaveUserProfile = ({
  repository,
}: CreateSaveUserProfileParams): SaveUserProfile => {
  return (params) => repository.save(params);
};
