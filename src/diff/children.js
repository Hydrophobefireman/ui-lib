import { unmountDomTree } from "../lifeCycleRunner.js";
import { diff } from "./index.js";

import { appendChild } from "../util.js";

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
  const largerNodesLength =
    newChildrenLength >= oldChildrenLength
      ? newChildrenLength
      : oldChildrenLength;

  const retArr = [];

  for (let i = 0; i < largerNodesLength; i++) {
    let newChild = newParentVnode._children[i];
    let oldChild = oldChildren[i];
    if (newChild == null) {
      if (oldChild == null) {
        continue;
      }
      unmountDomTree(oldChild);
      continue;
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
    let next;
    if (oldChild != null) {
      next = oldChild._nextDomNode;
    }
    const isFragmentChildren = Array.isArray(dom);
    if (isFragmentChildren) {
      for (const c of dom) {
        appendChild(parentDom, c, next);
        retArr.push(c);
      }
    } else {
      appendChild(parentDom, dom, next);
      retArr.push(dom);
    }
  }
  return retArr;
  /**@todo keys */
}
