import type { ReactNode } from "react";
import {
  UserProfileDependenciesContext,
  type UserProfileDependencies,
} from "./user-profile-dependencies.context";

type UserProfileDependenciesProviderProps = {
  dependencies: UserProfileDependencies;
  children: ReactNode;
};

export const UserProfileDependenciesProvider = ({
  dependencies,
  children,
}: UserProfileDependenciesProviderProps) => (
  <UserProfileDependenciesContext value={dependencies}>
    {children}
  </UserProfileDependenciesContext>
);
