import { useEffect, useState } from "react";
import {
  createProfileAutosave,
  type ProfileAutosave,
} from "../../application/create-profile-autosave";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import type { UserProfile } from "../../domain/entities/user-profile";
import { useUserProfileDependencies } from "../providers/user-profile-dependencies.context";

export type UseProfileAutosaveResult = {
  autosave: ProfileAutosave;
  initialProfile: UserProfile;
};

export const useProfileAutosave = (): UseProfileAutosaveResult => {
  const { save, draftStore } = useUserProfileDependencies();
  const [state] = useState(() => {
    const draft = draftStore.load();
    const initialProfile = draft?.profile ?? INITIAL_USER_PROFILE;
    const autosave = createProfileAutosave({
      save,
      draftStore,
      initialSnapshot: initialProfile,
    });

    return {
      autosave,
      initialProfile,
      shouldSyncDraft: draft !== null && !draft.synced,
    };
  });

  useEffect(() => {
    if (state.shouldSyncDraft) {
      state.autosave.schedule(state.initialProfile);
    }

    return () => {
      state.autosave.dispose();
    };
  }, [state]);

  return {
    autosave: state.autosave,
    initialProfile: state.initialProfile,
  };
};
