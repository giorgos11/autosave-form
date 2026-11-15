import {
  createHttpUserProfileRepository,
  createSaveUserProfile,
  type UserProfileDependencies,
} from "@/features/user-profile";
import { createHttpClient } from "@/shared/api/http-client";
import { env } from "@/shared/config/env";

const httpClient = createHttpClient({ baseUrl: env.apiBaseUrl });

const userProfileRepository = createHttpUserProfileRepository({ httpClient });

export const dependencies = {
  userProfile: {
    save: createSaveUserProfile({ repository: userProfileRepository }),
  } satisfies UserProfileDependencies,
} as const;

export type Dependencies = typeof dependencies;
