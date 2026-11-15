import { env } from "@/shared/config/env";
import { delay, http, HttpResponse } from "msw";
import type { UserProfileDto } from "../http/user-profile.dto";
import { USER_PROFILE_ENDPOINTS } from "../http/user-profile.endpoints";
import { getMockConfig } from "./mock-config";

const PROFILE_URL = `${env.apiBaseUrl}${USER_PROFILE_ENDPOINTS.profile}`;

const FAILING_EMAIL_DOMAIN = "@fail.test";
/** Deterministic conflict (409) — not a transient failure. */
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
  http.put(PROFILE_URL, async ({ request }) => {
    const profile = (await request.json()) as UserProfileDto;
    const { errorRate, latencyMinMs, latencyMaxMs } = getMockConfig();

    await delay(randomInt(latencyMinMs, latencyMaxMs));

    if (profile.email.endsWith(CONFLICT_EMAIL_DOMAIN)) {
      return HttpResponse.json(
        { message: "Profile was updated elsewhere" },
        { status: 409 },
      );
    }

    if (
      profile.email.endsWith(FAILING_EMAIL_DOMAIN) ||
      Math.random() < errorRate
    ) {
      return randomFailure();
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
