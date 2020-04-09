import { VNode, UIElement } from "../types";
import { Fragment } from "../create_element";
import { EMPTY_ARR, EMPTY_OBJ, getFinalVnode } from "../util";
import { unmountVNodeAndDestroyDom } from "./updater";
import { diff } from "./index";
import {
  getClosestDomElementFromFragmentChildren,
  placeDomNodeAroundSibDomsifNeeded,
} from "./dom";
export function diffChildren(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: Node,
  meta: { depth: number }
) {
  const newChildren: (VNode | null)[] = newVNode._children || EMPTY_ARR;
  const oldChildren: (VNode | null)[] =
    oldVNode != null ? oldVNode._children || EMPTY_ARR : null;
  const isFragment = newVNode.type === Fragment;
  if (newChildren === EMPTY_ARR) {
    return oldChildren.forEach((x) => unmountVNodeAndDestroyDom(x));
  }
  if (isFragment) {
    return __diffFragmentChildren(
      newVNode,
      oldVNode,
      newChildren,
      oldChildren,
      parentDom,
      meta
    );
  }
  return diffEachChild(newVNode, newChildren, oldChildren, parentDom, meta);
}

function __diffFragmentChildren(
  newVNode: VNode,
  oldVNode: VNode,
  newChildren: (VNode | null)[],
  oldChildren: (VNode | null)[],
  parentDom: Node,
  meta: { depth: number }
) {
  if ((oldVNode || EMPTY_OBJ).type !== Fragment) {
    const tempParentNode = document.createDocumentFragment();
    newChildren.forEach((x) =>
      diff(x, null, (tempParentNode as any) as Element, null, meta)
    );
    placeDomNodeAroundSibDomsifNeeded(
      tempParentNode,
      getFinalVnode((oldVNode || newVNode)._nextSibDomVnode || EMPTY_OBJ)._dom,
      parentDom
    );
  } else {
    diffEachChild(
      newVNode,
      newChildren,
      oldChildren,
      parentDom,
      meta,
      oldVNode
    );
  }
  newVNode._FragmentDomNodeChildren = newChildren.map((x) => {
    x._parentDom = newVNode._parentDom;
    return __domOF(x);
  }) as any /**@fix */;
}

function diffEachChild(
  newVNode: VNode,
  newChildren: (VNode | null)[],
  oldChildren: (VNode | null)[],
  parentDom: Node,
  meta: { depth: number },
  oldVNode?: VNode
) {
  oldChildren = oldChildren || EMPTY_ARR;
  newChildren = newChildren || EMPTY_ARR;
  const newChildrenLen = newChildren.length;
  const oldChildrenLen = oldChildren.length;
  const larger = Math.max(newChildrenLen, oldChildrenLen);

  for (let i = 0; i < larger; i++) {
    const newChild = newChildren[i] || null;
    const oldChild = oldChildren[i];
    const simpleOldChild = getFinalVnode(oldChild);
    let oldDom: UIElement | Text | (UIElement | Text)[] = __domOF(
      simpleOldChild
    );
    oldDom = getClosestDomElementFromFragmentChildren(oldDom) as UIElement;

    if (oldDom == null && newChild != null) {
      let sibDom: UIElement | null = getNextSibDom(
        oldChildren,
        i + i,
        oldChildrenLen
      );

      newChild._nextSibDomVnode = sibDom
        ? sibDom._VNode
        : oldVNode._nextSibDomVnode;
    }

    diff(
      newChild,
      oldChild,
      parentDom || (__domOF(newVNode) as Node),
      null,
      meta
    );
  }
}

function getNextSibDom(
  oldChildren: (VNode | null)[],
  index: number,
  oldLen: number
): UIElement | null {
  if (index >= oldLen) return null;
  const nextChild = oldChildren[index] || EMPTY_OBJ;
  const nextDom = getClosestDomElementFromFragmentChildren(__domOF(nextChild));
  return (
    (nextDom as UIElement) || getNextSibDom(oldChildren, index + 1, oldLen)
  );
}

const __domOF = (x: VNode) => {
  const nextChild = getFinalVnode(x);
  return nextChild
    ? nextChild._dom || nextChild._FragmentDomNodeChildren
    : null;
};
