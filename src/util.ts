import { UIElement, VNode } from "./types";
import { copyPropsOverEntireTree } from "./diff/dom";
import { Component } from "./component";

export const EMPTY_OBJ: any = {};
export const EMPTY_ARR: any[] = [];

type flatMap<T> = (e: T | T[]) => T;

function $flat<T>(arr: T[] | T[][], flattenedArray: T[], map: flatMap<T>): T[] {
  if (!arr) return flattenedArray;
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (Array.isArray(el)) {
      $flat(el, flattenedArray, map);
    } else {
      flattenedArray.push(map ? map(el) : (el as T));
    }
  }
  return flattenedArray;
}

/** flattens array (to `Infinity`) */
export function flattenArray<T>(array: T[] | T[][], map?: flatMap<T>): T[] {
  const flattened: T[] = [];
  return $flat(array, flattened, map);
}

export function isListener(attr: string): boolean {
  return attr[0] === "o" && attr[1] === "n";
}

const hasOwnProp = EMPTY_OBJ.hasOwnProperty;
const _Object = EMPTY_OBJ.constructor as ObjectConstructor;
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

export function clearDOM(dom: Element) {
  let c: ChildNode;
  while ((c = dom.firstChild)) {
    dom.removeChild(c);
  }
}

const propPSD = "_prevSibDomVNode";
const propNSD = "_nextSibDomVNode";
/**
 * copy random dom data that stays static during the diff
 * @param target target VNode - most likely newVNode of diff function
 * @param source source VNode - most likely oldVNode of diff function
 */
export function copyVNodePointers(newVNode: VNode, oldVNode: VNode) {
  if (oldVNode === EMPTY_OBJ || newVNode == null || oldVNode == null) return;

  const _prevSibDomVNode = oldVNode._prevSibDomVNode;

  const shouldUpdatePrevSibVNodeProps =
    newVNode._prevSibDomVNode == null && _prevSibDomVNode != null;

  if (shouldUpdatePrevSibVNodeProps) {
    copyPropsOverEntireTree(newVNode, propPSD, _prevSibDomVNode);
    copyPropsOverEntireTree(_prevSibDomVNode, propNSD, newVNode);
  }

  const _nextSibDomVNode = oldVNode._nextSibDomVNode;

  const shouldUpdateNextSibVNodeProps =
    newVNode._nextSibDomVNode == null && _nextSibDomVNode != null;

  if (shouldUpdateNextSibVNodeProps) {
    copyPropsOverEntireTree(newVNode, propNSD, _nextSibDomVNode);
    copyPropsOverEntireTree(_nextSibDomVNode, propPSD, newVNode);
  }
}

/** check if the given vnode is renderable  */
export function isValidVNode(V: VNode) {
  if (!V || V.constructor !== undefined) {
    console.warn("component not of expected type =>", V);
    return false;
  }
  return true;
}

export function getClosestDom(VNode: VNode): UIElement {
  if (!VNode) return;
  const dom = VNode._dom;
  if (dom) return dom;
  const fragDom = VNode._FragmentDomNodeChildren;
  if (fragDom) {
    return _getDom(fragDom);
  }
}

function _getDom(fDom: VNode["_FragmentDomNodeChildren"]): UIElement {
  for (let i = 0; i < fDom.length; i++) {
    const e = fDom[i];
    if (Array.isArray(e)) {
      const next = _getDom(e);
      if (next) return next;
      continue;
    }
    if (e) return e as UIElement;
  }
}

