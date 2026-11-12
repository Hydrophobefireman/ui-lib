import type {ContextProvider} from "./types/index.js";

export function isProvider(value: unknown): value is ContextProvider {
  return (
    value != null &&
    typeof (value as ContextProvider).getChildContext === "function"
  );
}
