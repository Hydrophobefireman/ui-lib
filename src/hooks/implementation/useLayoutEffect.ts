import { effect } from "./_effect";
import { layoutPendingCallbacks } from "./manage";

export function useLayoutEffect(
  callback: () => (() => unknown) | unknown,
  dependencies?: unknown[]
): void {
  return effect(callback, dependencies, layoutPendingCallbacks);
}
