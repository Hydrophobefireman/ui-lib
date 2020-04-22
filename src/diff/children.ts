import { VNode, UIElement, DiffMeta } from "../types";
import { Fragment } from "../create_element";
import {
  EMPTY_ARR,
  EMPTY_OBJ,
  getClosestDom,
  getSibVNodeFromFragmentChildren,
} from "../util";
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
    const newChild: VNode = newChildren[i];
    const oldChild: VNode = oldChildren[i] || EMPTY_OBJ;

    if (oldChild._nextSibDomVNode == null) {
      let sibDom: UIElement | null = getNextSibDom(
        oldChildren,
        i + i,
        oldChildrenLen
      );
      const _nextSibDomVNode = sibDom
        ? sibDom._VNode
        : isFragment
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
}

function getNextSibDom(
  oldChildren: (VNode | null)[],
  index: number,
  oldLen: number
): UIElement | null {
  if (index >= oldLen) return null;
  const nextChild = oldChildren[index] || EMPTY_OBJ;
  const nextDom = getClosestDom(nextChild);
  return (
    (nextDom as UIElement) || getNextSibDom(oldChildren, index + 1, oldLen)
  );
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
