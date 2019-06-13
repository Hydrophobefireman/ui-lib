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
  const newChildren = newParentVnode._children;
  const newChildrenLength = newChildren.length;
  const oldChildrenLength = oldChildren.length;
  const retArr = [];
  for (let i = 0; i < Math.max(newChildrenLength, oldChildrenLength); i++) {
    const newChild = newChildren[i];
    let oldChild = oldChildren[i];
    let nextOldChild;
    if (newChild == null) {
      if (oldChild != null) {
        unmountDomTree(oldChild);
      }
      continue;
    }
    if (oldChild == null && (nextOldChild = oldChildren[i + 1]) != null) {
      const nextOldDom = nextOldChild._dom;
      const nextDom = Array.isArray(nextOldDom) ? nextOldDom[0] : nextOldDom;
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
    if (!Array.isArray(dom)) {
      appendChild(parentDom, dom);
      retArr.push(dom);
    }
  }

  return retArr;
}
