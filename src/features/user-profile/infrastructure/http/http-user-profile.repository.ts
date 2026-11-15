import type { HttpClient } from "@/shared/api/http-client";
import type { UserProfileRepository } from "../../domain/ports/user-profile.repository";
import { USER_PROFILE_ENDPOINTS } from "./user-profile.endpoints";
import { toUserProfileDto } from "./user-profile.mapper";

export type CreateHttpUserProfileRepositoryParams = {
  httpClient: HttpClient;
};

export const createHttpUserProfileRepository = ({
  httpClient,
}: CreateHttpUserProfileRepositoryParams): UserProfileRepository => ({
  save: async (profile) => {
    await httpClient.put<void>(
      USER_PROFILE_ENDPOINTS.profile,
      toUserProfileDto(profile),
    );
  },
});
