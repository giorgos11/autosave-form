import { useEffect, useSyncExternalStore } from "react";
import type {
  AutosaveStatus,
  ProfileAutosave,
} from "../../application/create-profile-autosave";

const BASE_TITLE = "Autosave Form";

const titleForStatus = (status: AutosaveStatus): string => {
  switch (status.kind) {
    case "saving":
      return `Saving… · ${BASE_TITLE}`;
    case "saved":
      return `Saved · ${BASE_TITLE}`;
    case "retrying":
    case "error":
      return `Error · ${BASE_TITLE}`;
    case "conflict":
      return `Conflict · ${BASE_TITLE}`;
    case "idle":
      return BASE_TITLE;
  }
};

export const useAutosaveDocumentTitle = (
  autosave: Pick<ProfileAutosave, "subscribe" | "getStatus">,
) => {
  const status = useSyncExternalStore(autosave.subscribe, autosave.getStatus);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = titleForStatus(status);
    return () => {
      document.title = previousTitle;
    };
  }, [status]);
};
