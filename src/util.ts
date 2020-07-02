import { EMPTY_OBJ } from "./constants";
import { VNode } from "./types/index";

// function identity<T>(x: T): T {
//   return x;
// }

type FlatMap<T> = (e: T | T[]) => T;
function flat<T>(arr: T[] | T[][], flattenedArray: T[], map: FlatMap<T>): T[] {
  if (!arr) return flattenedArray;
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (Array.isArray(el)) {
      flat(el, flattenedArray, map);
    } else {
      flattenedArray.push(map ? map(el) : (el as T));
    }
  }
  return flattenedArray;
}
/** flattens array (to `Infinity`) */
export function flattenArray<T>(array: T[] | T[][], map?: FlatMap<T>): T[] {
  const flattened: T[] = [];
  return flat(array, flattened, map);
}

const hasOwnProp = EMPTY_OBJ.hasOwnProperty;
const $Object = EMPTY_OBJ.constructor as ObjectConstructor;

export const assign = ($Object.assign ||
  function Object_assign(target: {}) {
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

export function clearDOM(dom: Element) {
  let c: ChildNode;
  while ((c = dom.firstChild)) {
    dom.removeChild(c);
  }
}

export function isValidVNode(V: VNode, undef?: undefined) {
  if (!V || V.constructor !== undef) {
    console.warn("component not of expected type =>", V);
    return false;
  }
  return true;
}

interface OmitFrom {
  <T, K extends [...(keyof T)[]]>(obj: T, keys: K): Omit<T, K[number]>;
}

export const objectWithoutKeys: OmitFrom = (obj, keys) => {
  let ret = {} as {
    [K in keyof typeof obj]: typeof obj[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (keys.indexOf(key) === -1) {
      ret[key] = obj[key];
    }
  }
  return ret;
};
