import { useMemo } from "./useMemo";

export function useCallback<T>(
  fn: (...a: unknown[]) => T,
  dependencies?: any[]
) {
  return useMemo(() => fn, dependencies);
}
