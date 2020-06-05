import { consumeCallable } from "./util";
import { useReducer } from "./useReducer";

export function useState<T>(
  initialState: T | (() => T)
): [T, (previousState: T) => void] {
  return useReducer(consumeCallable as any, initialState);
}
