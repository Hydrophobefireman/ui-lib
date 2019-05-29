/**
 *  @TODO refactor loops and fix variable naming
 */
import { Fragment, toVnode } from "../create-element.js";
import { flattenArray, EMPTY_OBJ, EMPTY_ARR } from "../util.js";
import { unmountDomTree, runLifeCycle } from "../lifeCycleRunner.js";
import { diffDom } from "./dom.js";
import { diffChildren } from "./children.js";
import { toSimpleVnode } from "./toSimpleVnode.js";
/**
 *
 * @param {import("../ui").UiElement} parentDom
 * @param {import("../ui").vNode} newVnode
 * @param {import("../ui").vNode} oldVnode
 * @param {object} context
 * @param {Array<import("../ui").UiComponent>} mounts
 * @param {import("../ui").UiComponent} previousComponent
 * @param {boolean} force
 */
export function diff(
  parentDom,
  newVnode,
  oldVnode,
  context,
  mounts,
  previousComponent,
  force
) {
  if (typeof newVnode === "boolean") {
    newVnode = null;
  }
  if (oldVnode != null && newVnode != null) {
    newVnode._nextDomNode = oldVnode._nextDomNode;
  }
  if (
    oldVnode == null ||
    newVnode == null ||
    oldVnode.type !== newVnode.type ||
    oldVnode.key !== newVnode.key
  ) {
    if (oldVnode != null && oldVnode !== EMPTY_OBJ) {
      unmountDomTree(oldVnode);
    }
    if (newVnode == null) {
      return null;
    }
    oldVnode = EMPTY_OBJ;
  }
  const shouldGenerateNewTree = oldVnode === EMPTY_OBJ;

  if (newVnode.__uAttr !== newVnode) {
    console.warn("component not of expected type =>", newVnode);
    return null;
  }

  newVnode._children = flattenArray(
    (newVnode.props && newVnode.props.children) || [],
    Infinity,
    toVnode
  );
  const newType = newVnode.type;
  if (newType === Fragment || oldVnode.type == Fragment) {
    if (newVnode.type !== Fragment) {
      const oldSimilarChild = getSimilarChildTo(
        newType,
        oldVnode._children || EMPTY_ARR
      );
      const removeChildren = (oldVnode._children || EMPTY_ARR).filter(
        x => x !== oldSimilarChild
      );
      for (const c of removeChildren) {
        unmountDomTree(c);
      }
    } else {
      return diffChildren(
        newVnode,
        shouldGenerateNewTree ? EMPTY_ARR : oldVnode._children || EMPTY_ARR,
        parentDom,
        context,
        mounts,
        previousComponent,
        force
      );
    }
  }
  if (typeof newType === "function") {
    let node;
    node = toSimpleVnode(
      newVnode,
      oldVnode,
      parentDom,
      mounts,
      context,
      force,
      previousComponent
    );
    if (newVnode._component != null) newVnode._component._vnode = newVnode;
    if (node === EMPTY_OBJ) return null; //scu returned false
    if (node == null) return oldVnode._dom;
    node._dom = newVnode._dom = diff(
      parentDom,
      node,
      oldVnode._prevVnode || oldVnode,
      context,
      mounts,
      newVnode._component,
      force
    );
    if (newVnode._component != null) newVnode._component.base = newVnode._dom;
    runLifeCycle(
      newVnode._component,
      "componentDidUpdate",
      oldVnode.props,
      (oldVnode._component || EMPTY_OBJ)._oldState
    );
    if (oldVnode._component != null) delete oldVnode._component._oldState;
    newVnode._prevVnode = node;
    if (newVnode._dom != null) {
      newVnode._dom._vNode = newVnode;
    }
    return newVnode._dom;
  } else {
    if (shouldGenerateNewTree) {
      newVnode._dom = diffDom(newVnode, null, null, true);
    } else {
      newVnode._dom = diffDom(newVnode, oldVnode, oldVnode._dom, false);
    }
    if (previousComponent != null) {
      previousComponent.base = newVnode._dom;
    }
  }
  newVnode._dom._vNode = newVnode;
  diffChildren(
    newVnode,
    shouldGenerateNewTree ? EMPTY_ARR : oldVnode._children || EMPTY_ARR,
    newVnode._dom,
    context,
    mounts,
    newVnode._component,
    force
  );
  // if (oldVnode._component != null) {
  //   runLifeCycle(newVnode._component, "componentDidUpdate");
  // }
  return newVnode._dom;
}

/**
 *
 * @param {import("../ui").vNode['type']} type
 * @param {import("../ui").vNode['_children']} childArr
 */
function getSimilarChildTo(type, childArr) {
  for (const child of childArr) {
    if (child.type === type) {
      return child;
    }
  }
}
