import { consumeCallable } from "./util";
import { useReducer } from "./useReducer";

// the useState hook
// we accept either a value or a function (incase the value is expensive) as the argument
// internally we simply use a useReducer hook
type StateArg<T> = T | (() => T);

export function useState<T>(
  initialState: StateArg<T>
): [T, (previousState?: StateArg<T>) => void] {
  return useReducer(consumeCallable as any, initialState);
}
