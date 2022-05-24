import {consumeCallable} from "./util";
import {useReducer} from "./useReducer";

// the useState hook
// we accept either a value or a function (incase the value is expensive) as the argument
// internally we simply use a useReducer hook

type StateArg<T> = T | (() => T);
type Updater<T> = (arg: T | ((previous: T) => T)) => void;
type SetStateHookReturn<T> = [T, Updater<T>];
export function useState<T>(initialState?: StateArg<T>): SetStateHookReturn<T> {
  return useReducer(
    consumeCallable as any,
    initialState
  ) as SetStateHookReturn<T>;
}
