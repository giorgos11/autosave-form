import { env } from "@/shared/config/env";
import { delay, http, HttpResponse } from "msw";
import type { SaveUserProfileRequestDto } from "../http/user-profile.dto";
import { USER_PROFILE_ENDPOINTS } from "../http/user-profile.endpoints";
import { getMockConfig } from "./mock-config";
import {
  getStoredUserProfileDocument,
  setStoredUserProfileDocument,
} from "./user-profile.store";

const PROFILE_URL = `${env.apiBaseUrl}${USER_PROFILE_ENDPOINTS.profile}`;

const FAILING_EMAIL_DOMAIN = "@fail.test";
const CONFLICT_EMAIL_DOMAIN = "@conflict.test";

const FAILURE_RESPONSES = [
  () =>
    HttpResponse.json({ message: "Internal server error" }, { status: 500 }),
  () => HttpResponse.json({ message: "Service unavailable" }, { status: 503 }),
  () => HttpResponse.error(),
];

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFailure = () =>
  FAILURE_RESPONSES[randomInt(0, FAILURE_RESPONSES.length - 1)]();

export const userProfileHandlers = [
  http.get(PROFILE_URL, async () => {
    const { latencyMinMs, latencyMaxMs } = getMockConfig();
    await delay(randomInt(latencyMinMs, latencyMaxMs));
    return HttpResponse.json(getStoredUserProfileDocument());
  }),

  http.put(PROFILE_URL, async ({ request }) => {
    const body = (await request.json()) as SaveUserProfileRequestDto;
    const { errorRate, latencyMinMs, latencyMaxMs } = getMockConfig();
    const current = getStoredUserProfileDocument();

    await delay(randomInt(latencyMinMs, latencyMaxMs));

    if (
      body.profile.email.endsWith(CONFLICT_EMAIL_DOMAIN) &&
      body.revision === current.revision
    ) {
      setStoredUserProfileDocument({
        revision: current.revision + 1,
        profile: {
          ...current.profile,
          bio:
            current.profile.bio.trim() === ""
              ? "(updated elsewhere)"
              : current.profile.bio,
        },
      });
      return HttpResponse.json(
        { message: "Profile was updated elsewhere" },
        { status: 409 },
      );
    }

    if (body.revision !== current.revision) {
      return HttpResponse.json(
        {
          message: "Profile was updated elsewhere",
          currentRevision: current.revision,
        },
        { status: 409 },
      );
    }

    if (
      body.profile.email.endsWith(FAILING_EMAIL_DOMAIN) ||
      Math.random() < errorRate
    ) {
      return randomFailure();
    }

    const nextRevision = current.revision + 1;
    setStoredUserProfileDocument({
      revision: nextRevision,
      profile: body.profile,
    });

    return HttpResponse.json({ revision: nextRevision });
  }),
];
