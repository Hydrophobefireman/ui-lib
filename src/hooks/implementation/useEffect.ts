import {effect} from "./_effect.js";
import {rafPendingCallbacks} from "./manage.js";

export function useEffect(
  callback: () => (() => unknown) | unknown,
  dependencies?: unknown[]
): void {
  return effect(callback, dependencies, rafPendingCallbacks);
}
