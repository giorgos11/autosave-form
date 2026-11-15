import {
  UserProfileDependenciesProvider,
  UserProfilePage,
} from "@/features/user-profile";
import { dependencies } from "./composition-root";

export const App = () => {
  return (
    <UserProfileDependenciesProvider dependencies={dependencies.userProfile}>
      <UserProfilePage />
    </UserProfileDependenciesProvider>
  );
};
