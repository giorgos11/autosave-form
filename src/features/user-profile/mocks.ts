// Separate public entry for dev/test mocks, so MSW never ends up in the runtime API (`index.ts`).
export { userProfileHandlers } from "./infrastructure/mocks/user-profile.handlers";
