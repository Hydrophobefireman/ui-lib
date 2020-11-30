import { UIElement, VNode } from "./types/internal";

import { Component } from "./component";
import { EMPTY_OBJ } from "./constants";
import { RefType } from "./types/index";

export type { RefType };

export function _setRef<T>(ref: ((value: T) => void) | RefType<T>, value: T) {
  if (!ref) return;
  if (typeof ref == "function") ref(value);
  else ref.current = value;
}

export function diffReferences<T = UIElement | Component>(
  newVNode: VNode,
  oldVNode: VNode,
  domOrComponent: T
) {
  const newRef = newVNode.ref;
  const oldRef = (oldVNode || EMPTY_OBJ).ref;
  if (newRef && newRef !== oldRef) {
    _setRef(newRef, domOrComponent);
    oldRef && _setRef(oldVNode.ref, null);
  }
}

export function createRef<T>() {
  return { current: null } as RefType<T>;
}
