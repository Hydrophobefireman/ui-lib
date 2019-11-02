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
 * @param {import("../ui").vNode} __next
 */
export function diff(
  parentDom,
  newVnode,
  oldVnode,
  context,
  mounts,
  previousComponent,
  force,
  __next
) {
  if (typeof newVnode === "boolean") newVnode = null;
  if (
    oldVnode == null ||
    newVnode == null ||
    oldVnode.type !== newVnode.type
    // oldVnode.key !== newVnode.key no stable keys implementation
  ) {
    if (oldVnode != null && oldVnode !== EMPTY_OBJ) {
      unmountDomTree(oldVnode);
    }
    if (newVnode == null) {
      return null;
    }
    oldVnode = EMPTY_OBJ;
  }
  if (oldVnode != null && newVnode != null && newVnode._nextDomNode == null) {
    newVnode._nextDomNode = oldVnode._nextDomNode;
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
  if (newType === Fragment || oldVnode.type === Fragment) {
    return diffChildren(
      newVnode,
      shouldGenerateNewTree ? EMPTY_ARR : oldVnode._children || EMPTY_ARR,
      parentDom,
      context,
      mounts,
      previousComponent,
      force,
      __next
    );
  }
  if (typeof newType === "function") {
    let node;
    const _obj = toSimpleVnode(
      newVnode,
      oldVnode,
      parentDom,
      mounts,
      context,
      force,
      previousComponent
    );
    node = _obj.node;
    const shouldUpdate = _obj.shouldUpdate;
    if (newVnode._component != null) newVnode._component._vnode = newVnode;
    if (node === EMPTY_OBJ) return null; //scu returned false
    const dom = (newVnode._dom = diff(
      parentDom,
      node,
      "_prevVnode" in oldVnode ? oldVnode._prevVnode : oldVnode,
      context,
      mounts,
      newVnode._component,
      force
    ));
    if (node == null) return;
    node._dom = dom;
    if (newVnode._component != null) newVnode._component.base = dom;
    shouldUpdate &&
      runLifeCycle(
        newVnode._component,
        "componentDidUpdate",
        oldVnode.props,
        (oldVnode._component || EMPTY_OBJ)._oldState
      );
    if (oldVnode._component != null) delete oldVnode._component._oldState;
    newVnode._prevVnode = node;
    if (dom != null && !Array.isArray(dom)) {
      dom._vNode = newVnode;
    }
    return dom;
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
  const dom = newVnode._dom;
  dom._vNode = newVnode;
  diffChildren(
    newVnode,
    shouldGenerateNewTree ? EMPTY_ARR : oldVnode._children || EMPTY_ARR,
    dom,
    context,
    mounts,
    newVnode._component,
    force,
    __next
  );
  return dom;
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
