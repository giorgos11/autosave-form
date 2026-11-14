import { useEffect, useState } from "react";
import {
  createProfileAutosave,
  type AutosaveStatus,
  type ProfileAutosave,
} from "../../application/create-profile-autosave";
import { useUserProfileDependencies } from "../providers/user-profile-dependencies.context";

export type UseProfileAutosaveResult = {
  autosave: ProfileAutosave;
  saveStatus: AutosaveStatus;
};

export const useProfileAutosave = (): UseProfileAutosaveResult => {
  const { save } = useUserProfileDependencies();
  const [autosave] = useState(() => createProfileAutosave({ save }));
  const [saveStatus, setSaveStatus] = useState<AutosaveStatus>(() =>
    autosave.getStatus(),
  );

  useEffect(() => {
    const unsubscribe = autosave.subscribe(() => {
      setSaveStatus(autosave.getStatus());
    });

    return () => {
      unsubscribe();
      autosave.dispose();
    };
  }, [autosave]);

  return { autosave, saveStatus };
};
