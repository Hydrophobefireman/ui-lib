import {useMemo} from "./useMemo.js";

export function useRef<T>(initialValue?: T) {
  return useMemo(() => ({current: initialValue}), []);
}
