import { unmountDomTree } from "../lifeCycleRunner.js";
import { diff } from "./index.js";

import { appendChild, setDomNodeDescriptor } from "../util.js";
import { Fragment } from "../create-element.js";
const diffedVnode = {};
/**
 *
 * @param {import("../ui").vNode} newParentVnode
 * @param {import("../ui").vNode['_children']} oldChildren
 * @param {import("../ui").UiElement} parentDom
 * @param {object} context
 * @param {Array<import("../ui").UiComponent>} mounts
 * @param {import("../ui").UiComponent} previousComponent
 * @param {boolean} force
 */

export function diffChildren(
  newParentVnode,
  oldChildren,
  parentDom,
  context,
  mounts,
  previousComponent,
  force
) {
  const newChildrenLength = newParentVnode._children.length;
  const oldChildrenLength = oldChildren.length;
  const retArr = [];
  for (let i = 0; i < newChildrenLength; i++) {
    const newChild = newParentVnode._children[i];

    let oldChild = oldChildren[i];
    let nextOldChild;
    if (newChild == null) {
      if (oldChild != null) {
        unmountDomTree(oldChild);
      }
      continue;
    }
    newChild._reorder = false;
    if (oldChild == null && (nextOldChild = oldChildren[i + 1]) != null) {
      const nextDom =
        nextOldChild.type !== Fragment
          ? nextOldChild._dom
          : nextOldChild._dom[0];
      newChild._nextDomNode = nextDom;
    }
    const c = oldChild;
    let isDiffingKeyedNode = false;
    if (isKeyedChild(oldChild, newChild)) {
      mark(oldChild, c);
      isDiffingKeyedNode = true;
      oldChildren[i] = diffedVnode;
    } else {
      for (let j = 0; j < oldChildrenLength; j++) {
        oldChild = oldChildren[j];
        if (isKeyedChild(oldChild, newChild)) {
          isDiffingKeyedNode = true;
          mark(oldChild, c);
          newChild._reorder = true;
          oldChildren[j] = diffedVnode;
          break;
        }
        oldChild = null;
      }
    }
    if (!isDiffingKeyedNode) oldChildren[i] = diffedVnode;
    if (oldChild == null) oldChild = c;
    const dom = diff(
      parentDom,
      newChild,
      oldChild,
      context,
      mounts,
      previousComponent,
      force
    );
    const isFragmentChildren = Array.isArray(dom);
    if (isFragmentChildren) {
      for (const c of dom) {
        appendChild(parentDom, c);
        retArr.push(c);
      }
    } else {
      appendChild(parentDom, dom);
      retArr.push(dom);
    }
  }
  for (const i of oldChildren) {
    if (i != diffedVnode) unmountDomTree(i);
  }
  return retArr;
}
function isKeyedChild(o, n) {
  return o && n.key && n.key === o.key && n.type === o.type;
}
/**
 *
 * @param {import("../ui").vNode} o
 * @param {import("../ui").vNode} c
 */
function mark(o, c) {
  if (o != null && o._dom != null) {
    _mark(o);
  }
  if (c === o) return;
  if (c != null && c._dom != null) {
    _mark(c);
  }
}
/**
 *
 * @param {import("../ui").vNode} o
 */
const _mark = o => {
  o._nextDomNode = o._dom.nextSibling;
  o._prevDomNode = o._dom.previousSibling;
};
