import { VNode, DiffMeta, UIElement } from "../types/index";
import { Fragment, createElement } from "../create_element";
import { diff } from "./index";
import { NULL_TYPE, EMPTY_ARRAY, EMPTY_OBJ } from "../constants";
import { assign } from "../util";
import { isFn } from "../toSimpleVNode";

type VNodeChildren = VNode["_children"];

export function diffChildren(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: HTMLElement,
  meta: DiffMeta
) {
  if (newVNode.type === NULL_TYPE) return;

  const newChildren: VNodeChildren = newVNode._children || EMPTY_ARRAY;

  const oldChildren: VNodeChildren =
    (oldVNode || EMPTY_OBJ)._children || EMPTY_ARRAY;
  if (newChildren === oldChildren) return;
  return diffEachChild(newVNode, newChildren, oldChildren, parentDom, meta);
}

function diffEachChild(
  newParentVNode: VNode,
  newChildren: VNodeChildren,
  oldChildren: VNodeChildren,
  parentDom: HTMLElement,
  meta: DiffMeta
) {
  const isFragment = newParentVNode.type === Fragment;
  const newChildrenLen = newChildren.length;
  const oldChildrenLen = oldChildren.length;
  const larger = Math.max(newChildrenLen, oldChildrenLen);

  const lastSibling: UIElement = isFragment
    ? ((oldChildren[oldChildrenLen - 1] || EMPTY_OBJ)._dom || EMPTY_OBJ)
        .nextSibling
    : null;

  for (let i = 0; i < larger; i++) {
    const newChild: VNode =
      newChildren[i] || (i < newChildrenLen ? createElement(NULL_TYPE) : null);

    const unkeyedOldChild = oldChildren[i];
    let oldChild: VNode = unkeyedOldChild || EMPTY_OBJ;

    let next = (oldChildren[i + 1] || EMPTY_OBJ)._dom;

    if (next == null && isFragment) {
      next = meta.next || lastSibling;
    }
    const nextMeta: DiffMeta = assign({}, meta, { next });

    diff(newChild, oldChild, parentDom, false, nextMeta);
  }
}
