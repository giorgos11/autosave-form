import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INITIAL_USER_PROFILE } from "../domain/constants/initial-user-profile";
import type { UserProfile } from "../domain/entities/user-profile";
import { SaveUserProfileError } from "../domain/errors/save-user-profile.error";
import { createProfileAutosave } from "./create-profile-autosave";
import type { GetUserProfile } from "./get-user-profile";
import type { SaveUserProfile } from "./save-user-profile";

const profile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  ...INITIAL_USER_PROFILE,
  ...overrides,
});

const createDeferred = () => {
  let resolve!: (value: { revision: number }) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<{ revision: number }>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const saveOk: SaveUserProfile = async ({ revision }) => ({
  revision: revision + 1,
});

const retryableError = () =>
  new SaveUserProfileError({
    message: "transient",
    retryable: true,
  });

const nonRetryableError = () =>
  new SaveUserProfileError({
    message: "bad request",
    retryable: false,
  });

const conflictError = () =>
  new SaveUserProfileError({
    message: "Profile was updated elsewhere",
    retryable: false,
    conflict: true,
  });

const defaultGet: GetUserProfile = async () => ({
  revision: 0,
  profile: INITIAL_USER_PROFILE,
});

const createAutosave = (
  params: Omit<Parameters<typeof createProfileAutosave>[0], "get"> & {
    get?: GetUserProfile;
  },
) =>
  createProfileAutosave({
    get: defaultGet,
    ...params,
  });

describe("createProfileAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts idle and does not save before the debounce elapses", async () => {
    const save = vi.fn<SaveUserProfile>().mockImplementation(saveOk);
    const autosave = createAutosave({ save, debounceMs: 500 });

    expect(autosave.getStatus()).toEqual({ kind: "idle" });
    expect(autosave.getRevision()).toBe(0);

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(499);

    expect(save).not.toHaveBeenCalled();
    expect(autosave.getStatus()).toEqual({ kind: "idle" });
  });

  it("saves with the current revision and advances it on success", async () => {
    const save = vi.fn<SaveUserProfile>().mockImplementation(saveOk);
    const autosave = createAutosave({ save, debounceMs: 500 });
    const snapshot = profile({ fullName: "Ada Lovelace" });

    autosave.schedule(snapshot);
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ profile: snapshot, revision: 0 });
    expect(autosave.getRevision()).toBe(1);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("resets the debounce and only persists the latest scheduled snapshot", async () => {
    const save = vi.fn<SaveUserProfile>().mockImplementation(saveOk);
    const autosave = createAutosave({ save, debounceMs: 500 });
    const first = profile({ fullName: "A" });
    const second = profile({ fullName: "Ada" });

    autosave.schedule(first);
    await vi.advanceTimersByTimeAsync(400);
    autosave.schedule(second);
    await vi.advanceTimersByTimeAsync(499);

    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ profile: second, revision: 0 });
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("exposes saving while a request is in flight", async () => {
    const deferred = createDeferred();
    const save = vi.fn<SaveUserProfile>().mockReturnValue(deferred.promise);
    const autosave = createAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);

    expect(autosave.getStatus()).toEqual({ kind: "saving" });

    deferred.resolve({ revision: 1 });
    await vi.runAllTimersAsync();

    expect(autosave.getStatus()).toEqual({ kind: "saved" });
    expect(autosave.getRevision()).toBe(1);
  });

  it("coalesces edits made while a save is in flight into one follow-up save", async () => {
    const firstSave = createDeferred();
    const save = vi
      .fn<SaveUserProfile>()
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(saveOk);

    const autosave = createAutosave({ save, debounceMs: 500 });
    const duringFlight = profile({ fullName: "Ada Lovelace" });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toEqual({ kind: "saving" });

    autosave.schedule(duringFlight);
    await vi.advanceTimersByTimeAsync(500);

    expect(save).toHaveBeenCalledTimes(1);

    firstSave.resolve({ revision: 1 });
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({
      profile: duringFlight,
      revision: 1,
    });
    expect(autosave.getRevision()).toBe(2);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("retries retryable failures with exponential backoff then succeeds", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValueOnce(retryableError())
      .mockRejectedValueOnce(retryableError())
      .mockImplementationOnce(saveOk);

    const autosave = createAutosave({
      save,
      debounceMs: 500,
      maxRetries: 3,
      retryBaseDelayMs: 1000,
    });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toEqual({
      kind: "retrying",
      attempt: 1,
      maxAttempts: 4,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenCalledTimes(2);
    expect(autosave.getStatus()).toEqual({
      kind: "retrying",
      attempt: 2,
      maxAttempts: 4,
    });

    await vi.advanceTimersByTimeAsync(2000);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(3);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
    expect(autosave.getRevision()).toBe(1);
  });

  it("stops retrying after maxRetries and marks error", async () => {
    const save = vi.fn<SaveUserProfile>().mockRejectedValue(retryableError());
    const autosave = createAutosave({
      save,
      debounceMs: 500,
      maxRetries: 3,
      retryBaseDelayMs: 1000,
    });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500); // attempt 1 fails → retry 1
    await vi.advanceTimersByTimeAsync(1000); // attempt 2 fails → retry 2
    await vi.advanceTimersByTimeAsync(2000); // attempt 3 fails → retry 3
    await vi.advanceTimersByTimeAsync(4000); // attempt 4 fails → error
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(4);
    expect(autosave.getStatus()).toEqual({ kind: "error" });
    expect(autosave.getRevision()).toBe(0);
  });

  it("retry() after a terminal error starts a fresh save attempt", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValueOnce(nonRetryableError())
      .mockImplementationOnce(saveOk);

    const autosave = createAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toEqual({ kind: "error" });

    autosave.retry();
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(2);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("does not retry non-retryable failures", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValue(nonRetryableError());
    const autosave = createAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toEqual({ kind: "error" });
  });

  it("cancels a pending retry when the user edits again", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValueOnce(retryableError())
      .mockImplementationOnce(saveOk);

    const autosave = createAutosave({
      save,
      debounceMs: 500,
      retryBaseDelayMs: 1000,
    });

    autosave.schedule(profile({ fullName: "A" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(autosave.getStatus().kind).toBe("retrying");

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(499);
    expect(save).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(2);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("can schedule again after an error", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValueOnce(nonRetryableError())
      .mockImplementationOnce(saveOk);
    const autosave = createAutosave({ save, debounceMs: 500 });
    const recovered = profile({ fullName: "Ada" });

    autosave.schedule(profile({ fullName: "A" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toEqual({ kind: "error" });

    autosave.schedule(recovered);
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({
      profile: recovered,
      revision: 0,
    });
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("notifies subscribers when status changes and stops after unsubscribe", async () => {
    const save = vi.fn<SaveUserProfile>().mockImplementation(saveOk);
    const autosave = createAutosave({ save, debounceMs: 500 });
    const listener = vi.fn();

    const unsubscribe = autosave.subscribe(listener);

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(listener).toHaveBeenCalled();
    const callsAfterSave = listener.mock.calls.length;

    unsubscribe();
    autosave.schedule(profile({ fullName: "Ada Lovelace" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(listener).toHaveBeenCalledTimes(callsAfterSave);
  });

  it("does not notify subscribers when status is unchanged", async () => {
    const firstSave = createDeferred();
    const secondSave = createDeferred();
    const save = vi
      .fn<SaveUserProfile>()
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(() => secondSave.promise);

    const autosave = createAutosave({ save, debounceMs: 500 });
    const listener = vi.fn();
    autosave.subscribe(listener);

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(autosave.getStatus()).toEqual({ kind: "saving" });
    expect(listener).toHaveBeenCalledTimes(1);

    autosave.schedule(profile({ fullName: "Ada Lovelace" }));
    firstSave.resolve({ revision: 1 });
    await Promise.resolve();

    expect(autosave.getStatus()).toEqual({ kind: "saving" });
    expect(listener).toHaveBeenCalledTimes(1);

    secondSave.resolve({ revision: 2 });
    await vi.runAllTimersAsync();

    expect(autosave.getStatus()).toEqual({ kind: "saved" });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("dispose cancels a pending debounced save and retry", async () => {
    const save = vi.fn<SaveUserProfile>().mockRejectedValue(retryableError());
    const autosave = createAutosave({
      save,
      debounceMs: 500,
      retryBaseDelayMs: 1000,
    });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(autosave.getStatus().kind).toBe("retrying");

    autosave.dispose();
    await vi.advanceTimersByTimeAsync(1000);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("marks conflict on 409-class errors and does not retry", async () => {
    const save = vi.fn<SaveUserProfile>().mockRejectedValue(conflictError());
    const autosave = createAutosave({
      save,
      debounceMs: 500,
      retryBaseDelayMs: 1000,
    });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });
  });

  it("keeps local edits during conflict but does not autosave again", async () => {
    const save = vi.fn<SaveUserProfile>().mockRejectedValue(conflictError());
    const draftStore = {
      load: vi.fn(),
      save: vi.fn(),
      clear: vi.fn(),
    };
    const autosave = createAutosave({
      save,
      draftStore,
      debounceMs: 500,
    });
    const localEdit = profile({ fullName: "Ada Lovelace" });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });

    autosave.schedule(localEdit);
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });
    expect(draftStore.save).toHaveBeenLastCalledWith({
      profile: localEdit,
      synced: false,
    });
  });

  it("retry() is a no-op while in conflict", async () => {
    const save = vi.fn<SaveUserProfile>().mockRejectedValue(conflictError());
    const autosave = createAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });

    autosave.retry();
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });
  });

  it("keepMine rebases onto the server revision and saves local edits", async () => {
    const local = profile({ fullName: "Ada Lovelace" });
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValueOnce(conflictError())
      .mockImplementationOnce(saveOk);
    const get = vi.fn<GetUserProfile>().mockResolvedValue({
      revision: 1,
      profile: profile({ fullName: "Server Ada", bio: "(updated elsewhere)" }),
    });
    const autosave = createAutosave({ save, get, debounceMs: 500 });

    autosave.schedule(local);
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });

    await autosave.keepMine();
    await vi.runAllTimersAsync();

    expect(get).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith({ profile: local, revision: 1 });
    expect(autosave.getRevision()).toBe(2);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
  });

  it("useTheirs loads the server profile and resumes as saved", async () => {
    const serverProfile = profile({
      fullName: "Server Ada",
      bio: "(updated elsewhere)",
    });
    const save = vi.fn<SaveUserProfile>().mockRejectedValue(conflictError());
    const get = vi.fn<GetUserProfile>().mockResolvedValue({
      revision: 1,
      profile: serverProfile,
    });
    const autosave = createAutosave({ save, get, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toEqual({ kind: "conflict" });

    const loaded = await autosave.useTheirs();

    expect(loaded).toEqual(serverProfile);
    expect(autosave.getRevision()).toBe(1);
    expect(autosave.getStatus()).toEqual({ kind: "saved" });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("persists an unsynced draft on schedule and marks it synced after save", async () => {
    const save = vi.fn<SaveUserProfile>().mockImplementation(saveOk);
    const draftStore = {
      load: vi.fn(),
      save: vi.fn(),
      clear: vi.fn(),
    };
    const snapshot = profile({ fullName: "Ada" });
    const autosave = createAutosave({
      save,
      draftStore,
      debounceMs: 500,
    });

    autosave.schedule(snapshot);
    expect(draftStore.save).toHaveBeenCalledWith({
      profile: snapshot,
      synced: false,
    });

    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(draftStore.save).toHaveBeenLastCalledWith({
      profile: snapshot,
      synced: true,
    });
  });
});
