import { beforeEach, describe, expect, it } from "vitest";
import { INITIAL_USER_PROFILE } from "../../domain/constants/initial-user-profile";
import {
  createLocalStorageUserProfileDraftStore,
  USER_PROFILE_DRAFT_STORAGE_KEY,
} from "./local-storage-user-profile-draft.store";

const createMemoryStorage = (): Storage => {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    key: (index) => [...data.keys()][index] ?? null,
  };
};

describe("createLocalStorageUserProfileDraftStore", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("returns null when nothing is stored", () => {
    const store = createLocalStorageUserProfileDraftStore({ storage });
    expect(store.load()).toBeNull();
  });

  it("round-trips a draft", () => {
    const store = createLocalStorageUserProfileDraftStore({ storage });
    const draft = {
      profile: { ...INITIAL_USER_PROFILE, fullName: "Ada" },
      synced: false,
    };

    store.save(draft);

    expect(store.load()).toEqual(draft);
    expect(storage.getItem(USER_PROFILE_DRAFT_STORAGE_KEY)).toContain("Ada");
  });

  it("ignores corrupt JSON", () => {
    storage.setItem(USER_PROFILE_DRAFT_STORAGE_KEY, "{not-json");
    const store = createLocalStorageUserProfileDraftStore({ storage });

    expect(store.load()).toBeNull();
  });

  it("ignores payloads that are not a valid draft", () => {
    storage.setItem(
      USER_PROFILE_DRAFT_STORAGE_KEY,
      JSON.stringify({ profile: { fullName: "Ada" }, synced: false }),
    );
    const store = createLocalStorageUserProfileDraftStore({ storage });

    expect(store.load()).toBeNull();
  });

  it("clear removes the draft", () => {
    const store = createLocalStorageUserProfileDraftStore({ storage });
    store.save({ profile: INITIAL_USER_PROFILE, synced: true });
    store.clear();

    expect(store.load()).toBeNull();
  });
});
