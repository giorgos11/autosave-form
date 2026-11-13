import type { UserProfile } from "../entities/user-profile";

export type UserProfileRepository = {
  load: () => Promise<UserProfile | null>;
  save: (profile: UserProfile) => Promise<void>;
};
