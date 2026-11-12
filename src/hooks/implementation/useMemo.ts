import {
  argsChanged,
  getCurrentHookValueOrSetDefault,
} from "./util.js";
import type {HookDefault} from "./util.js";
import {getHookStateAtCurrentRender} from "./manage.js";

export function useMemo<T>(memoFunc: () => T, dependencies?: any[]): T {
  const state = getHookStateAtCurrentRender();

  const candidate = state[0];
  const hookIndex = state[1];

  const hookData = candidate._hooksData;

  const currentHook: HookDefault = getCurrentHookValueOrSetDefault(
    hookData,
    hookIndex,
    () => ({})
  );

  if (!argsChanged(currentHook.args, dependencies))
    return currentHook.hookState;

  const nextValue = memoFunc();
  currentHook.hookState = nextValue;
  currentHook.args = dependencies;

  return nextValue;
}
