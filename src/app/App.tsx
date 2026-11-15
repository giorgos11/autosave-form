import {
  UserProfileDependenciesProvider,
  UserProfilePage,
} from "@/features/user-profile";
import { dependencies } from "./composition-root";
import { AppShell } from "./layout/AppShell";

export const App = () => {
  return (
    <UserProfileDependenciesProvider dependencies={dependencies.userProfile}>
      <AppShell>
        <UserProfilePage />
      </AppShell>
    </UserProfileDependenciesProvider>
  );
};
