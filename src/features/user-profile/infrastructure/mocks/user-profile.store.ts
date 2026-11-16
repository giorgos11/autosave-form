import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type { UserProfileDto } from "../http/user-profile.dto";
import { toUserProfileDto } from "../http/user-profile.mapper";

/** In-memory server profile for MSW — source of truth for GET / PUT in the demo. */
let storedProfile: UserProfileDto = toUserProfileDto(INITIAL_USER_PROFILE);

export const getStoredUserProfile = (): UserProfileDto => storedProfile;

export const setStoredUserProfile = (profile: UserProfileDto): void => {
  storedProfile = profile;
};

export const resetStoredUserProfile = (): void => {
  storedProfile = toUserProfileDto(INITIAL_USER_PROFILE);
};
