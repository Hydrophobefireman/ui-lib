import { useMemo } from "./useMemo";

export function useCallback<T extends Array<any>, U>(
  fn: (...args: T) => U,
  dependencies?: any[]
) {
  return useMemo(() => fn, dependencies);
}
