import { VNode, DiffMeta } from "../types/index";
import { Fragment, createElement } from "../create_element";
import { diff } from "./index";
import { NULL_TYPE, EMPTY_ARRAY, EMPTY_OBJ } from "../constants";
import { copyVNodePointers, copyPropsUpwards } from "../VNodePointers";

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

  for (let i = 0; i < larger; i++) {
    const newChild: VNode =
      newChildren[i] || (i < newChildrenLen ? createElement(NULL_TYPE) : null);

    const unkeyedOldChild = oldChildren[i];
    let oldChild: VNode = unkeyedOldChild || EMPTY_OBJ;

    copyVNodePointers(newChild, oldChild);

    if (newChild && newChild._nextSibDomVNode == null) {
      const _nextSibDomVNode = isFragment
        ? newParentVNode._nextSibDomVNode
        : null;
      if (_nextSibDomVNode != null) {
        copyPropsUpwards(newChild, "_nextSibDomVNode", _nextSibDomVNode);
      }
    }
    diff(newChild, oldChild, parentDom, false, meta);
    isFragment &&
      newChild != null &&
      updateFragmentDomPointers(newParentVNode, newChild, i);
  }

  if (isFragment && newChildrenLen) {
    const c = newParentVNode._children;
    const t = c[newChildrenLen - 1]._nextSibDomVNode;
    copyPropsUpwards(newParentVNode, "_nextSibDomVNode", t);
    copyPropsUpwards(newParentVNode, "_prevSibDomVNode", c[0]._prevSibDomVNode);
  }
}

function updateFragmentDomPointers(
  newParentVNode: VNode,
  x: VNode,
  index: number
) {
  const domChild = x && ((x._dom || x._FragmentDomNodeChildren) as any);
  let arr = newParentVNode._FragmentDomNodeChildren;
  if (arr == null) {
    arr = [];
    copyPropsUpwards(newParentVNode, "_FragmentDomNodeChildren", arr);
  }
  arr[index] = domChild;
}
