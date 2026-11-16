import { useEffect } from "react";
import type { ProfileAutosave } from "../../application/create-profile-autosave";

export const useUnsavedChangesWarning = (
  autosave: Pick<ProfileAutosave, "hasUnsavedChanges">,
) => {
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!autosave.hasUnsavedChanges()) return;
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [autosave]);
};
