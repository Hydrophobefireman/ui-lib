import { consumeCallable, getCurrentHookValueOrSetDefault } from "./util";

import { getHookStateAtCurrentRender } from "./manage";

type Reducer<T> = (currentValue: T, action: string) => T;
const obj = {};
export function useReducer<T = any>(
  reducer: Reducer<T>,
  initialValue: T | (() => T),
  setup?: <T>(a: T) => any
): [T, (action?: any) => void] {
  const state = getHookStateAtCurrentRender();

  const candidate = state[0];

  const currentHookIndex = state[1];

  const hookData = candidate._hooksData;

  const currentHook = getCurrentHookValueOrSetDefault(
    hookData,
    currentHookIndex,
    () => ({
      hookState: setup
        ? setup(initialValue)
        : consumeCallable(null, initialValue),
    })
  );

  return [
    currentHook.hookState as T,
    currentHook.args ||
      (currentHook.args = (action?: any) => {
        const next = (reducer as Reducer<T>)(currentHook.hookState, action);
        currentHook.hookState = next;
        candidate.setState(obj);
      }),
  ];
}
