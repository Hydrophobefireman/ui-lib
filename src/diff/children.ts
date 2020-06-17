import { VNode, DiffMeta } from "../types";
import { Fragment, createElement, NULL_TYPE } from "../create_element";
import { EMPTY_ARR, EMPTY_OBJ, copyVNodePointers } from "../util";
import { diff } from "./index";
import { updateInternalVNodes } from "./dom";

type VNodeChildren = VNode["_children"];

export function diffChildren(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: HTMLElement,
  meta: DiffMeta
) {
  if (newVNode.type === NULL_TYPE) return;

  const newChildren: VNodeChildren = newVNode._children || EMPTY_ARR;

  const oldChildren: VNodeChildren =
    (oldVNode || EMPTY_OBJ)._children || EMPTY_ARR;

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
      newChildren[i] ||
      (i < newChildrenLen ? createElement(NULL_TYPE) : null);
    const unkeyedOldChild = oldChildren[i];
    let oldChild: VNode = unkeyedOldChild || EMPTY_OBJ;

    copyVNodePointers(newChild, oldChild);

    if (oldChild === ((EMPTY_ARR as unknown) as VNode)) {
      const next = i + 1;
      oldChild = oldChildren[next];
    }

    if (newChild && newChild._nextSibDomVNode == null) {
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
    isFragment &&
      newChild != null &&
      updateFragmentDomPointers(newParentVNode, newChild, i);
  }
  if (isFragment && newChildrenLen) {
    const c = newParentVNode._children;
    const t = c[newChildrenLen - 1]._nextSibDomVNode;
    updateInternalVNodes(newParentVNode, "_nextSibDomVNode", t, "_renderedBy");
    updateInternalVNodes(
      newParentVNode,
      "_prevSibDomVNode",
      c[0]._prevSibDomVNode,
      "_renderedBy"
    );
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
    updateInternalVNodes(
      newParentVNode,
      "_FragmentDomNodeChildren",
      arr,
      "_renderedBy"
    );
  }
  arr[index] = domChild;
}

// function findKeyedNode(
//   child: VNode,
//   oldChildren: VNode[],
//   oldChildrenLen: number
// ) {
//   if (child == null) return;
//   const key = child.key;
//   for (let i = 0; i < oldChildrenLen; i++) {
//     const oldChild = oldChildren[i];
//     if (oldChild.key == key && oldChild.type === child.type) {
//       oldChildren[i] = (EMPTY_ARR as unknown) as VNode;
//       return oldChild;
//     }
//   }
//   // return null;
// }
