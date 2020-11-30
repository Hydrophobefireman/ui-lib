import { effect } from "./_effect";
import { rafPendingCallbacks } from "./manage";

export function useEffect(
  callback: () => (() => unknown) | unknown,
  dependencies?: unknown[]
): void {
  return effect(callback, dependencies, rafPendingCallbacks);
}
