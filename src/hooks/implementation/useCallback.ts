import { useMemo } from "./useMemo";

export function useCallback<T>(fn: () => T, dependencies: any[]) {
  return useMemo(() => fn, dependencies);
}
