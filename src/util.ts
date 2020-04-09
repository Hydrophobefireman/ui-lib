import { VNode } from "./types";

export const EMPTY_OBJ: any = {};
export const EMPTY_ARR = [];
type flatMap<T> = (e: T | T[]) => T;
function _flat<T>(
  arr: T[] | T[][],
  flattenedArray: T[],
  map: flatMap<T>,
  removeHoles: boolean
): T[] {
  if (!arr) return flattenedArray;
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (Array.isArray(el)) {
      _flat(el, flattenedArray, map, removeHoles);
    } else {
      if (!removeHoles || el != null)
        flattenedArray.push(map ? map(el) : (el as T));
    }
  }
  return flattenedArray;
}

/** flattens array (to `Infinity`) */
export function flattenArray<T>(
  array: T[] | T[][],
  map?: flatMap<T>,
  removeHoles?: boolean
): T[] {
  const flattened: T[] = [];
  return _flat(array, flattened, map, removeHoles);
}

export function isListener(attr: string): boolean {
  return attr[0] === "o" && attr[1] === "n";
}
const hasOwnProp = {}.hasOwnProperty;
const _Object = {}.constructor as ObjectConstructor;
export const assign = ("assign" in Object
  ? _Object.assign
  : function Object_assign(target: {}) {
      for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
          if (hasOwnProp.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }) as ObjectConstructor["assign"];

export function getFinalVnode(VNode: VNode): VNode {
  let next: VNode = VNode;
  if (!next) return null;
  return next._renders ? getFinalVnode(next._renders) : next;
}
