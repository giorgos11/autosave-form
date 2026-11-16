import type { UserProfile } from "../entities/user-profile";

export type UserProfileRepository = {
  get: () => Promise<UserProfile>;
  save: (profile: UserProfile) => Promise<void>;
};
