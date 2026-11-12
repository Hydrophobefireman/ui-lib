import {useMemo} from "./useMemo.js";

export function useCallback<T extends Array<any>, U>(
  fn: (...args: T) => U,
  dependencies?: any[]
) {
  return useMemo(() => fn, dependencies);
}
