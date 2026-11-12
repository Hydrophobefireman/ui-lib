import {consumeCallable, getCurrentHookValueOrSetDefault} from "./util.js";

import {getHookStateAtCurrentRender} from "./manage.js";

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

  // The dispatch function is stable, but the reducer always comes from the
  // latest render. Without this, dispatch would keep using the first reducer.
  currentHook.reducer = reducer;

  return [
    currentHook.hookState as T,
    currentHook.args ||
      (currentHook.args = (action?: any) => {
        const next = (currentHook.reducer as Reducer<T>)(
          currentHook.hookState,
          action
        );
        currentHook.hookState = next;
        candidate.setState(obj);
      }),
  ];
}
