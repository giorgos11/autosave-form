import type { UserProfile } from "../domain/entities/user-profile";
import type { SaveUserProfile } from "./save-user-profile";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export type ProfileAutosave = {
  schedule: (snapshot: UserProfile) => void;
  getStatus: () => AutosaveStatus;
  subscribe: (listener: () => void) => () => void;
  dispose: () => void;
};

export type CreateProfileAutosaveParams = {
  save: SaveUserProfile;
  debounceMs?: number;
};

export const createProfileAutosave = ({
  save,
  debounceMs = 500,
}: CreateProfileAutosaveParams): ProfileAutosave => {
  const listeners = new Set<() => void>();

  let status: AutosaveStatus = "idle";
  let latestSnapshot: UserProfile | null = null;
  let generation = 0;
  let savedGeneration = 0;
  let inFlight = false;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const setStatus = (next: AutosaveStatus) => {
    if (status === next) return;
    status = next;
    listeners.forEach((listener) => listener());
  };

  const runSave = async () => {
    if (inFlight) return;
    if (savedGeneration === generation) return;
    if (latestSnapshot === null) return;

    inFlight = true;
    setStatus("saving");

    const currentGeneration = generation;
    const snapshot = latestSnapshot;

    try {
      await save(snapshot);
      savedGeneration = currentGeneration;
      inFlight = false;

      if (savedGeneration !== generation) {
        await runSave();
        return;
      }

      setStatus("saved");
    } catch {
      inFlight = false;
      setStatus("error");
    }
  };

  return {
    schedule: (snapshot) => {
      latestSnapshot = snapshot;
      generation += 1;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined;
        void runSave();
      }, debounceMs);
    },

    getStatus: () => status,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    dispose: () => {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    },
  };
};
