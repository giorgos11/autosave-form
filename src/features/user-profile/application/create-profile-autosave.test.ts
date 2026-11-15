import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INITIAL_USER_PROFILE } from "../domain/constants/initial-user-profile";
import type { UserProfile } from "../domain/entities/user-profile";
import { createProfileAutosave } from "./create-profile-autosave";
import type { SaveUserProfile } from "./save-user-profile";

const profile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  ...INITIAL_USER_PROFILE,
  ...overrides,
});

const createDeferred = () => {
  let resolve!: () => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("createProfileAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts idle and does not save before the debounce elapses", async () => {
    const save = vi.fn<SaveUserProfile>().mockResolvedValue(undefined);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });

    expect(autosave.getStatus()).toBe("idle");

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(499);

    expect(save).not.toHaveBeenCalled();
    expect(autosave.getStatus()).toBe("idle");
  });

  it("saves the latest snapshot after the debounce and marks status saved", async () => {
    const save = vi.fn<SaveUserProfile>().mockResolvedValue(undefined);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });
    const snapshot = profile({ fullName: "Ada Lovelace" });

    autosave.schedule(snapshot);
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(snapshot);
    expect(autosave.getStatus()).toBe("saved");
  });

  it("resets the debounce and only persists the latest scheduled snapshot", async () => {
    const save = vi.fn<SaveUserProfile>().mockResolvedValue(undefined);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });
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
    expect(save).toHaveBeenCalledWith(second);
    expect(autosave.getStatus()).toBe("saved");
  });

  it("exposes saving while a request is in flight", async () => {
    const deferred = createDeferred();
    const save = vi.fn<SaveUserProfile>().mockReturnValue(deferred.promise);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);

    expect(autosave.getStatus()).toBe("saving");

    deferred.resolve();
    await vi.runAllTimersAsync();

    expect(autosave.getStatus()).toBe("saved");
  });

  it("coalesces edits made while a save is in flight into one follow-up save", async () => {
    const firstSave = createDeferred();
    const save = vi
      .fn<SaveUserProfile>()
      .mockImplementationOnce(() => firstSave.promise)
      .mockResolvedValueOnce(undefined);

    const autosave = createProfileAutosave({ save, debounceMs: 500 });
    const duringFlight = profile({ fullName: "Ada Lovelace" });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.getStatus()).toBe("saving");

    autosave.schedule(duringFlight);
    await vi.advanceTimersByTimeAsync(500);

    // Still only the first request; the debounced wake-up is ignored while in flight.
    expect(save).toHaveBeenCalledTimes(1);

    firstSave.resolve();
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(duringFlight);
    expect(autosave.getStatus()).toBe("saved");
  });

  it("marks status error when save fails", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValue(new Error("network down"));
    const autosave = createProfileAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(autosave.getStatus()).toBe("error");
  });

  it("can schedule again after an error", async () => {
    const save = vi
      .fn<SaveUserProfile>()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(undefined);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });
    const recovered = profile({ fullName: "Ada" });

    autosave.schedule(profile({ fullName: "A" }));
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();
    expect(autosave.getStatus()).toBe("error");

    autosave.schedule(recovered);
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(recovered);
    expect(autosave.getStatus()).toBe("saved");
  });

  it("notifies subscribers when status changes and stops after unsubscribe", async () => {
    const save = vi.fn<SaveUserProfile>().mockResolvedValue(undefined);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });
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

    const autosave = createProfileAutosave({ save, debounceMs: 500 });
    const listener = vi.fn();
    autosave.subscribe(listener);

    autosave.schedule(profile({ fullName: "Ada" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(autosave.getStatus()).toBe("saving");
    expect(listener).toHaveBeenCalledTimes(1);

    // Newer edit while saving — follow-up runSave keeps status at "saving".
    autosave.schedule(profile({ fullName: "Ada Lovelace" }));
    firstSave.resolve();
    await Promise.resolve();

    expect(autosave.getStatus()).toBe("saving");
    expect(listener).toHaveBeenCalledTimes(1);

    secondSave.resolve();
    await vi.runAllTimersAsync();

    expect(autosave.getStatus()).toBe("saved");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("dispose cancels a pending debounced save", async () => {
    const save = vi.fn<SaveUserProfile>().mockResolvedValue(undefined);
    const autosave = createProfileAutosave({ save, debounceMs: 500 });

    autosave.schedule(profile({ fullName: "Ada" }));
    autosave.dispose();
    await vi.advanceTimersByTimeAsync(500);
    await vi.runAllTimersAsync();

    expect(save).not.toHaveBeenCalled();
    expect(autosave.getStatus()).toBe("idle");
  });
});
