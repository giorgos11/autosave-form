import { createContext, useContext } from "react";
import type { SaveUserProfile } from "../../application/save-user-profile";
import type { UserProfileDraftStore } from "../../domain/ports/user-profile-draft.store";

export type UserProfileDependencies = {
  save: SaveUserProfile;
  draftStore: UserProfileDraftStore;
};

export const UserProfileDependenciesContext =
  createContext<UserProfileDependencies | null>(null);

export const useUserProfileDependencies = (): UserProfileDependencies => {
  const dependencies = useContext(UserProfileDependenciesContext);
  if (!dependencies) {
    throw new Error(
      "useUserProfileDependencies must be used within a UserProfileDependenciesProvider",
    );
  }
  return dependencies;
};
