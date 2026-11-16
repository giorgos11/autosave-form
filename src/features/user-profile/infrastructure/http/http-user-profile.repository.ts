import type { HttpClient } from "@/shared/api/http-client";
import { isHttpError } from "@/shared/api/http-error";
import { SaveUserProfileError } from "../../domain/errors/save-user-profile.error";
import type { UserProfileRepository } from "../../domain/ports/user-profile.repository";
import type {
  SaveUserProfileResponseDto,
  UserProfileDocumentDto,
} from "./user-profile.dto";
import { USER_PROFILE_ENDPOINTS } from "./user-profile.endpoints";
import { toUserProfile, toUserProfileDto } from "./user-profile.mapper";

const RETRYABLE_CLIENT_STATUSES = new Set([408, 429]);

const isRetryableStatus = (status: number) =>
  status >= 500 || RETRYABLE_CLIENT_STATUSES.has(status);

const toSaveUserProfileError = (error: unknown): SaveUserProfileError => {
  if (isHttpError(error)) {
    return new SaveUserProfileError({
      message: error.message,
      retryable: isRetryableStatus(error.status),
      cause: error,
    });
  }

  if (error instanceof TypeError) {
    return new SaveUserProfileError({
      message: "Network error while saving the profile",
      retryable: true,
      cause: error,
    });
  }

  return new SaveUserProfileError({
    message: "Unexpected error while saving the profile",
    retryable: false,
    cause: error,
  });
};

export type CreateHttpUserProfileRepositoryParams = {
  httpClient: HttpClient;
};

export const createHttpUserProfileRepository = ({
  httpClient,
}: CreateHttpUserProfileRepositoryParams): UserProfileRepository => ({
  get: async () => {
    const dto = await httpClient.get<UserProfileDocumentDto>(
      USER_PROFILE_ENDPOINTS.profile,
    );
    return {
      revision: dto.revision,
      profile: toUserProfile(dto.profile),
    };
  },

  save: async ({ profile, revision }) => {
    try {
      const response = await httpClient.put<SaveUserProfileResponseDto>(
        USER_PROFILE_ENDPOINTS.profile,
        {
          revision,
          profile: toUserProfileDto(profile),
        },
      );
      return { revision: response.revision };
    } catch (error) {
      throw toSaveUserProfileError(error);
    }
  },
});
