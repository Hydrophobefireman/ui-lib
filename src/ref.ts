import type {UIElement, VNode, RefType} from "./types/index.js";

import type {Component} from "./component.js";
import {EMPTY_OBJ} from "./constants.js";

export type {RefType};

export function setRef<T>(ref: ((value: T) => void) | RefType<T>, value: T) {
  if (!ref) return;
  if (typeof ref == "function") ref(value);
  else ref.current = value;
}

export function diffReferences(
  newVNode: VNode,
  oldVNode: VNode,
  domOrComponent: UIElement | Component
) {
  const newRef = newVNode.ref;
  const oldRef = (oldVNode || EMPTY_OBJ).ref;
  if (newRef === oldRef) return;
  // Clear first so callback refs observe old=null before new=value.
  if (oldRef) setRef(oldRef, null);
  if (newRef) setRef(newRef, domOrComponent);
}

export function createRef<T>() {
  return {current: null} as RefType<T>;
}
