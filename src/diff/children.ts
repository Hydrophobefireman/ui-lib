import { VNode, DiffMeta } from "../types";
import { Fragment, createElement, PlaceHolder } from "../create_element";
import { EMPTY_ARR, EMPTY_OBJ } from "../util";
import { diff } from "./index";
import { updateInternalVNodes } from "./dom";

export function diffChildren(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: Node,
  meta: DiffMeta
) {
  const newChildren: (VNode | null)[] = newVNode._children || EMPTY_ARR;
  const oldChildren: (VNode | null)[] =
    (oldVNode || EMPTY_OBJ)._children || EMPTY_ARR;
  return diffEachChild(newVNode, newChildren, oldChildren, parentDom, meta);
}

function diffEachChild(
  newParentVNode: VNode,
  newChildren: (VNode | null)[],
  oldChildren: (VNode | null)[],
  parentDom: Node,
  meta: DiffMeta
) {
  const isFragment = newParentVNode.type === Fragment;
  const newChildrenLen = newChildren.length;
  const oldChildrenLen = oldChildren.length;
  const larger = Math.max(newChildrenLen, oldChildrenLen);

  for (let i = 0; i < larger; i++) {
    const newChild: VNode =
      newChildren[i] ||
      (i < newChildrenLen ? createElement(PlaceHolder) : null);
    const oldChild: VNode = oldChildren[i] || EMPTY_OBJ;

    if (oldChild._nextSibDomVNode == null) {
      const _nextSibDomVNode = isFragment
        ? newParentVNode._nextSibDomVNode
        : null;
      if (_nextSibDomVNode != null) {
        updateInternalVNodes(
          newChild,
          "_nextSibDomVNode",
          _nextSibDomVNode,
          "_renderedBy"
        );
      }
    }
    diff(newChild, oldChild, parentDom, null, meta);
    isFragment && updateFragmentDomPointers(newParentVNode, newChild, i);
  }
  if (isFragment && newChildrenLen) {
    const c = newParentVNode._children;
    const t = c[newChildrenLen - 1]._nextSibDomVNode;
    updateInternalVNodes(newParentVNode, "_nextSibDomVNode", t, "_renderedBy");
  }
}

function updateFragmentDomPointers(
  newParentVNode: VNode,
  x: VNode,
  index: number
) {
  if (x != null)
    updateInternalVNodes(
      newParentVNode,
      "_nextSibDomVNode",
      x._nextSibDomVNode,
      "_renderedBy"
    );
  const domChild = x && ((x._dom || x._FragmentDomNodeChildren) as any);
  let arr = newParentVNode._FragmentDomNodeChildren;
  if (arr == null) {
    arr = [];
    updateInternalVNodes(
      newParentVNode,
      "_FragmentDomNodeChildren",
      arr,
      "_renderedBy"
    );
  }
  arr[index] = domChild;
}
