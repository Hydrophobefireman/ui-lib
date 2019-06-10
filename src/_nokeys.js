import { unmountDomTree } from "../lifeCycleRunner.js";
import { diff } from "./index.js";

import { appendChild } from "../util.js";
import { Fragment } from "../create-element.js";
// KEYS IMPLEMENTATION PENDING
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
  for (let i = 0; i < Math.max(newChildrenLength, oldChildrenLength); i++) {
    const newChild = newParentVnode._children[i];
    let oldChild = oldChildren[i];
    let nextOldChild;
    if (newChild == null) {
      if (oldChild != null) unmountDomTree(oldChild);
      continue;
    }
    if (oldChild == null && (nextOldChild = oldChildren[i + 1]) != null) {
      const nextDom =
        nextOldChild.type !== Fragment
          ? nextOldChild._dom
          : nextOldChild._dom[0];
      newChild._nextDomNode = nextDom;
    }
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
  // for (const i of oldChildren) {
  //   if (i != null) unmountDomTree(i);
  // }
  return retArr;
}
function isKeyedChild(o, n) {
  return o && n.key === o.key && n.type === o.type;
}
