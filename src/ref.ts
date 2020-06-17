import { VNode, RenderedDom } from "./types/index";
import { Component } from "./component";
import { EMPTY_OBJ } from "./constants";

export function setRef<T>(
  ref: ((value: T) => void) | { current: T },
  value: T
) {
  if (!ref) return;
  if (typeof ref == "function") ref(value);
  else ref.current = value;
}

export function diffReferences(
  newVNode: VNode,
  oldVNode: VNode,
  domOrComponent: RenderedDom | Component
) {
  const newRef = newVNode.ref;
  const oldRef = (oldVNode || EMPTY_OBJ).ref;
  if (newRef && newRef !== oldRef) {
    setRef(newRef, domOrComponent);
    oldRef && setRef(oldVNode.ref, null);
  }
}

export function createRef<T>() {
  return { current: null } as { current: T };
}
