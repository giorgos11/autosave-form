import type { UserProfile } from "../domain/entities/user-profile";
import {
  isConflictSaveError,
  isRetryableSaveError,
} from "../domain/errors/save-user-profile.error";
import type { UserProfileDraftStore } from "../domain/ports/user-profile-draft.store";
import type { SaveUserProfile } from "./save-user-profile";

export type AutosaveStatus =
  | { readonly kind: "idle" }
  | { readonly kind: "saving" }
  | { readonly kind: "saved" }
  | {
      readonly kind: "retrying";
      readonly attempt: number;
      readonly maxAttempts: number;
    }
  | { readonly kind: "error" }
  | { readonly kind: "conflict" };

export type ProfileAutosave = {
  schedule: (snapshot: UserProfile) => void;
  retry: () => void;
  getStatus: () => AutosaveStatus;
  getRevision: () => number;
  subscribe: (listener: () => void) => () => void;
  dispose: () => void;
};

export type CreateProfileAutosaveParams = {
  save: SaveUserProfile;
  draftStore?: UserProfileDraftStore;
  initialSnapshot?: UserProfile;
  initialRevision?: number;
  debounceMs?: number;
  maxRetries?: number;
  retryBaseDelayMs?: number;
};

const isSameStatus = (a: AutosaveStatus, b: AutosaveStatus) =>
  a.kind === b.kind &&
  (a.kind !== "retrying" || (b.kind === "retrying" && a.attempt === b.attempt));

export const createProfileAutosave = ({
  save,
  draftStore,
  initialSnapshot,
  initialRevision = 0,
  debounceMs = 500,
  maxRetries = 3,
  retryBaseDelayMs = 1000,
}: CreateProfileAutosaveParams): ProfileAutosave => {
  const listeners = new Set<() => void>();

  let status: AutosaveStatus = { kind: "idle" };
  let latestSnapshot: UserProfile | null = initialSnapshot ?? null;
  let revision = initialRevision;
  let generation = 0;
  let savedGeneration = 0;
  let retryAttempts = 0;
  let inFlight = false;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const setStatus = (next: AutosaveStatus) => {
    if (isSameStatus(status, next)) return;
    status = next;
    listeners.forEach((listener) => listener());
  };

  const clearDebounce = () => {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  };

  const clearRetry = () => {
    clearTimeout(retryTimer);
    retryTimer = undefined;
  };

  const scheduleRetry = () => {
    retryAttempts += 1;
    const delayMs = retryBaseDelayMs * 2 ** (retryAttempts - 1);
    setStatus({
      kind: "retrying",
      attempt: retryAttempts,
      maxAttempts: maxRetries,
    });
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      void runSave();
    }, delayMs);
  };

  const persistDraft = (profile: UserProfile, synced: boolean) => {
    draftStore?.save({ profile, synced });
  };

  const runSave = async () => {
    if (status.kind === "conflict") return;
    if (inFlight) return;
    if (savedGeneration === generation) return;
    if (latestSnapshot === null) return;

    inFlight = true;
    setStatus({ kind: "saving" });

    const currentGeneration = generation;
    const snapshot = latestSnapshot;
    const expectedRevision = revision;

    try {
      const result = await save({
        profile: snapshot,
        revision: expectedRevision,
      });
      revision = result.revision;
      savedGeneration = currentGeneration;
      retryAttempts = 0;
      inFlight = false;
      persistDraft(snapshot, true);

      if (savedGeneration !== generation) {
        await runSave();
        return;
      }

      setStatus({ kind: "saved" });
    } catch (error) {
      inFlight = false;
      clearRetry();

      if (isConflictSaveError(error)) {
        retryAttempts = 0;
        setStatus({ kind: "conflict" });
        return;
      }

      if (isRetryableSaveError(error) && retryAttempts < maxRetries) {
        scheduleRetry();
      } else {
        setStatus({ kind: "error" });
      }
    }
  };

  return {
    schedule: (snapshot) => {
      latestSnapshot = snapshot;
      generation += 1;
      persistDraft(snapshot, false);

      // Conflict: keep local edits, pause network autosave until resolved (Step 4).
      if (status.kind === "conflict") {
        return;
      }

      retryAttempts = 0;
      clearRetry();
      clearDebounce();
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined;
        void runSave();
      }, debounceMs);
    },

    retry: () => {
      if (status.kind === "conflict") return;
      clearDebounce();
      clearRetry();
      retryAttempts = 0;
      void runSave();
    },

    getStatus: () => status,

    getRevision: () => revision,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    dispose: () => {
      clearDebounce();
      clearRetry();
    },
  };
};
