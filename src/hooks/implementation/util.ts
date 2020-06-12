import { Component } from "../../component";

export function argsChanged(oldArgs: any[], newArgs: any[]) {
  return !oldArgs || newArgs.some((arg, index) => arg !== oldArgs[index]);
}

export interface HookDefault {
  args?: any;
  hookState?: any;
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
