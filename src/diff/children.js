import { unmountDomTree } from "../lifeCycleRunner.js";
import { diff } from "./index.js";
import { appendChild, EMPTY_OBJ } from "../util.js";

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
    let oldChild = oldChildren[i] || EMPTY_OBJ;
    let nextOldChild;
    if (newChild == null) {
      if (oldChild != null) {
        unmountDomTree(oldChild);
      }
      continue;
    }
    let nextDom = newChild._nextDomNode || oldChild._nextDomNode;

    if (
      oldChild === EMPTY_OBJ &&
      (nextOldChild = getNextChild(oldChildren, oldChildrenLength, i)) != null
    ) {
      const nextOldDom = nextOldChild._dom;
      nextDom = Array.isArray(nextOldDom) ? nextOldDom[0] : nextOldDom;
      newChild._reorder = true;
    }
    newChild._nextDomNode = nextDom;
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

/**
 *
 * @param {import("../ui").vNode['_children']} oc
 * @param {Number} len
 * @param {Number} i
 * @returns {import("../ui").vNode}
 */
function getNextChild(oc, len, i) {
  let c;
  for (; i < len; i++) {
    c = oc[i];
    if (c) break;
  }
  return c;
}
