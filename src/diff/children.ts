import { DiffMeta, UIElement, VNode } from "../types/index";
import { EMPTY_ARRAY, EMPTY_OBJ, NULL_TYPE, Fragment } from "../constants";
import { createElement } from "../create_element";

import { assign } from "../util";
import { diff } from "./index";
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
    ? meta.next ||
      (getDom(oldChildren[oldChildrenLen - 1]) || EMPTY_OBJ).nextSibling
    : null;

  for (let i = 0; i < larger; i++) {
    const newChild: VNode =
      newChildren[i] || (i < newChildrenLen ? createElement(NULL_TYPE) : null);

    const unkeyedOldChild = oldChildren[i];
    let oldChild: VNode = unkeyedOldChild || EMPTY_OBJ;

    let next =
      (getDom(oldChild) || (EMPTY_OBJ as UIElement)).nextSibling || lastSibling;

    const nextMeta: DiffMeta = assign({}, meta, { next });

    diff(newChild, oldChild, parentDom, false, nextMeta);
  }
}

export function getDom(VNode: VNode): UIElement {
  if (!VNode || VNode === EMPTY_OBJ) return;
  while (isFn(VNode.type)) {
    VNode = VNode._renders;
  }
  if (VNode.type === Fragment) {
    const children = VNode._children || (EMPTY_ARRAY as VNode["_children"]);
    return getDom(children[children.length - 1]);
  }
  return VNode._dom;
}
