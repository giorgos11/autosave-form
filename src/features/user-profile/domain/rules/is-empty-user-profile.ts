import { INITIAL_USER_PROFILE } from "../constants/initial-user-profile";
import type { UserProfile } from "../entities/user-profile";
import { areUserProfilesEqual } from "./are-user-profiles-equal";

export const isEmptyUserProfile = (profile: UserProfile): boolean =>
  areUserProfilesEqual(profile, INITIAL_USER_PROFILE);
