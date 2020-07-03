import { useMemo } from "./useMemo";

export function useRef<T>(initialValue?: T) {
  return useMemo(() => ({ current: initialValue }), []);
}
