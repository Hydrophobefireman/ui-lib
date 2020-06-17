import { EMPTY_ARR } from "./util";

// import {} from "./types";
export function deprecateFunction<A, T>(
  fn: (...a: A[]) => T,
  functionName: string,
  newName?: string,
  apply?: any
): (...a: A[]) => T {
  let func = function () {
    deprecationWarning(
      functionName,
      "()' has been deprecated" +
        (newName ? " Use '" + newName + "()' instead" : "")
    );
    return fn.apply(apply, EMPTY_ARR.slice.call(arguments));
  };
  return func;
}

export function deprecateGetter(O: any, getterName: string, newName?: string) {
  const _getter = Object.getOwnPropertyDescriptor(O, newName).get.bind(O);
  Object.defineProperty(O, getterName, {
    get: deprecateFunction(_getter, getterName, newName),
  });
}

export function deprecationWarning(...a: any[]): void;
export function deprecationWarning(): void {
  const args = ["[DeprecationWarning]"].concat(EMPTY_ARR.slice.call(arguments));
  console.warn.apply(console, args);
}
