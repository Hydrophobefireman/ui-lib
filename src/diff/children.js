import { unmountDomTree } from "../lifeCycleRunner.js";
import { diff } from "./index.js";

import { appendChild } from "../util.js";
import { Fragment } from "../create-element.js";

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
    const nextOldChild = oldChildren[i + 1];
    if (newChild === oldChild) continue; // both are null
    if (newChild == null) {
      unmountDomTree(oldChild);
      continue;
    }
    if (oldChild == null && nextOldChild != null) {
      const nextDom =
        nextOldChild.type !== Fragment
          ? nextOldChild._dom
          : nextOldChild._dom[0];
      newChild._nextDomNode = nextDom;
    }
    if (oldChild === null || isKeyedChild(oldChild, newChild)) {
      oldChildren[i] = undefined;
    } else {
      for (let j = 0; j < oldChildrenLength; j++) {
        oldChild = oldChildren[j];
        if (isKeyedChild(oldChild, newChild)) {
          oldChildren[j] = undefined;
          break;
        }
        oldChild = null;
      }
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
  return retArr;
}
function isKeyedChild(o, n) {
  return o && n.key === o.key && n.type === o.type;
}
