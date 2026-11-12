import {effect} from "./_effect.js";
import {layoutPendingCallbacks} from "./manage.js";

export function useLayoutEffect(
  callback: () => (() => unknown) | unknown,
  dependencies?: unknown[]
): void {
  return effect(callback, dependencies, layoutPendingCallbacks);
}
