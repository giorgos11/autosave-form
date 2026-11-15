import { useEffect, useState } from "react";
import {
  createProfileAutosave,
  type ProfileAutosave,
} from "../../application/create-profile-autosave";
import { useUserProfileDependencies } from "../providers/user-profile-dependencies.context";

export const useProfileAutosave = (): ProfileAutosave => {
  const { save } = useUserProfileDependencies();
  const [autosave] = useState(() => createProfileAutosave({ save }));

  useEffect(() => {
    return () => {
      autosave.dispose();
    };
  }, [autosave]);

  return autosave;
};
