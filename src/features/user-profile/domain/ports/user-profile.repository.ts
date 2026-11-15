import type { UserProfile } from "../entities/user-profile";

export type UserProfileRepository = {
  save: (profile: UserProfile) => Promise<void>;
};
