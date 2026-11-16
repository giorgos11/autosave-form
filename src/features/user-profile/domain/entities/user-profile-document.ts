import type { UserProfile } from "./user-profile";

export type UserProfileDocument = {
  readonly revision: number;
  readonly profile: UserProfile;
};
