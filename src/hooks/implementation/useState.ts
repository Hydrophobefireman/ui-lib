import { consumeCallable } from "./util";
import { useReducer } from "./useReducer";
type StateArg<T> = T | (() => T);
export function useState<T>(
  initialState: StateArg<T>
): [T, (previousState?: StateArg<T>) => void] {
  return useReducer(consumeCallable as any, initialState);
}
