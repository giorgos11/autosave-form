import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type { UserProfileDocumentDto } from "../http/user-profile.dto";
import { toUserProfileDto } from "../http/user-profile.mapper";

let storedDocument: UserProfileDocumentDto = {
  revision: 0,
  profile: toUserProfileDto(INITIAL_USER_PROFILE),
};

export const getStoredUserProfileDocument = (): UserProfileDocumentDto =>
  storedDocument;

export const setStoredUserProfileDocument = (
  document: UserProfileDocumentDto,
): void => {
  storedDocument = document;
};

export const resetStoredUserProfileDocument = (): void => {
  storedDocument = {
    revision: 0,
    profile: toUserProfileDto(INITIAL_USER_PROFILE),
  };
};
