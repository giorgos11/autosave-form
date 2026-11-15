import type { UserProfile } from "../../domain/entities/user-profile";
import type {
  UserProfileDraft,
  UserProfileDraftStore,
} from "../../domain/ports/user-profile-draft.store";

export const USER_PROFILE_DRAFT_STORAGE_KEY =
  "autosave-form:user-profile-draft";

export type CreateLocalStorageUserProfileDraftStoreParams = {
  key?: string;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

const isSkill = (value: unknown): boolean =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { id?: unknown }).id === "string" &&
  typeof (value as { name?: unknown }).name === "string";

const isUserProfile = (value: unknown): value is UserProfile => {
  if (typeof value !== "object" || value === null) return false;

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.fullName === "string" &&
    typeof profile.email === "string" &&
    typeof profile.phone === "string" &&
    typeof profile.country === "string" &&
    typeof profile.bio === "string" &&
    typeof profile.dateOfBirth === "string" &&
    typeof profile.newsletter === "boolean" &&
    Array.isArray(profile.skills) &&
    profile.skills.every(isSkill)
  );
};

const isUserProfileDraft = (value: unknown): value is UserProfileDraft => {
  if (typeof value !== "object" || value === null) return false;

  const draft = value as Record<string, unknown>;
  return isUserProfile(draft.profile) && typeof draft.synced === "boolean";
};

export const createLocalStorageUserProfileDraftStore = ({
  key = USER_PROFILE_DRAFT_STORAGE_KEY,
  storage = localStorage,
}: CreateLocalStorageUserProfileDraftStoreParams = {}): UserProfileDraftStore => ({
  load: () => {
    try {
      const raw = storage.getItem(key);
      if (raw === null) return null;

      const parsed: unknown = JSON.parse(raw);
      return isUserProfileDraft(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  save: (draft) => {
    try {
      storage.setItem(key, JSON.stringify(draft));
    } catch {
      // Quota / private mode — draft persistence is best-effort.
    }
  },

  clear: () => {
    try {
      storage.removeItem(key);
    } catch {
      // ignore
    }
  },
});
