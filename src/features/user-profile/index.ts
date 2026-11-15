export { UserProfilePage } from "./presentation/pages/UserProfilePage/UserProfilePage";
export { UserProfileDependenciesProvider } from "./presentation/providers/UserProfileDependenciesProvider";
export type { UserProfileDependencies } from "./presentation/providers/user-profile-dependencies.context";

export {
  createSaveUserProfile,
  type SaveUserProfile,
} from "./application/save-user-profile";
export { createHttpUserProfileRepository } from "./infrastructure/http/http-user-profile.repository";
