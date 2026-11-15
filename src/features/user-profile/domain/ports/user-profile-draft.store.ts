import type { UserProfile } from "../entities/user-profile";

export type UserProfileDraft = {
  readonly profile: UserProfile;
  readonly synced: boolean;
};

export type UserProfileDraftStore = {
  load: () => UserProfileDraft | null;
  save: (draft: UserProfileDraft) => void;
  clear: () => void;
};
