import type { UserProfile } from "../entities/user-profile";
import type { UserProfileDocument } from "../entities/user-profile-document";

export type SaveUserProfileParams = {
  profile: UserProfile;
  revision: number;
};

export type SaveUserProfileResult = {
  revision: number;
};

export type UserProfileRepository = {
  get: () => Promise<UserProfileDocument>;
  save: (params: SaveUserProfileParams) => Promise<SaveUserProfileResult>;
};
