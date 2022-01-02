import {
  argsChanged,
  getCurrentHookValueOrSetDefault,
  HookDefault,
} from "./util";
import {getHookStateAtCurrentRender} from "./manage";

export function useMemo<T>(memoFunc: () => T, dependencies?: any[]): T {
  const state = getHookStateAtCurrentRender();

  const candidate = state[0];
  const hookIndex = state[1];

  const hookData = candidate._hooksData;

  let currentHook: HookDefault = hookData[hookIndex] || <any>{};

  if (!argsChanged(currentHook.args, dependencies))
    return currentHook.hookState;

  hookData[hookIndex] = null;
  currentHook = getCurrentHookValueOrSetDefault(hookData, hookIndex, () => ({
    hookState: memoFunc(),
  }));

  currentHook.args = dependencies;

  return currentHook.hookState;
}
