import { getHookStateAtCurrentRender } from "./manage";
import { getCurrentHookValueOrSetDefault, consumeCallable } from "./util";

type Reducer<T> = (currentValue: T, action: string) => T;

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
        : consumeCallable(void 0, initialValue),
    })
  );
  currentHook.args = reducer;

  return [
    currentHook.hookState as T,
    (action?: any) => {
      const next = ((currentHook.args as unknown) as Reducer<T>)(
        currentHook.hookState,
        action
      );
      currentHook.hookState = next;
      candidate.setState({});
    },
  ];
}
