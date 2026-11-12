import {Component} from "../../component.js";

export function argsChanged(oldArgs: any[], newArgs: any[]) {
  // Omitting the dependency array means "run on every render".
  if (newArgs == null) return true;
  if (oldArgs == null || oldArgs.length !== newArgs.length) return true;
  for (let i = 0; i < newArgs.length; i++) {
    // React-compatible dependency semantics: NaN equals NaN; +0/-0 differ.
    if (!Object.is(oldArgs[i], newArgs[i])) return true;
  }
  return false;
}

export interface HookDefault {
  args?: any;
  hookState?: any;
  reducer?: any;
  effect?: any;
}
type Coerce = Component["_hooksData"][0];

export function getCurrentHookValueOrSetDefault(
  hookData: Component["_hooksData"],
  currentHookIndex: number,
  defaultValues: HookDefault | (() => HookDefault)
) {
  return (
    hookData[currentHookIndex] ||
    (hookData[currentHookIndex] = <Coerce>consumeCallable(0, defaultValues))
  );
}

export function consumeCallable<T = {}>(
  arg: T,
  maybeCallable: ((a: T) => any) | any
) {
  return typeof maybeCallable === "function"
    ? maybeCallable(arg)
    : maybeCallable;
}
