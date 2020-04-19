import { VNode, ComponentType, DiffMeta } from "../types";
import { EMPTY_OBJ, copyVNodePointers, isValidVNode } from "../util";
import { unmountVNodeAndDestroyDom } from "./updater";
import { Fragment, flattenVNodeChildren } from "../create_element";
import { diffChildren } from "./children";
import {
  diffDomNode,
  flushChangesToDomIfNeeded,
  updateParentDomPointers,
} from "./dom";
import { toSimpleVNode, isFn } from "../toSimpleVNode";
// import { processUpdatesQueue } from "../lifeCycleCallbacks";

/**
 *
 * @param newVNode current state of dom represented as virtual nodes
 * @param oldVNode last state of dom represented as virtual nodes
 * @param parentDom parent dom element to append child on
 * @param force true if Component#forceUpdate()  was called
 * @param meta random data useful for tagging vnodes
 */
export function diff(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: Node,
  force: boolean,
  meta: DiffMeta
): Element | Text {
  if (typeof newVNode === "boolean") newVNode = null;

  const newVNodeISNULL = newVNode == null;
  const oldVNodeISNULL = oldVNode == null;

  let oldType: string | ComponentType;
  let newType: string | ComponentType;
  let isComplex: boolean;
  /** SCU returned False */
  if (newVNode === EMPTY_OBJ) return;
  copyVNodePointers(newVNode, oldVNode);
  if (newVNodeISNULL || oldVNodeISNULL || newVNode.type !== oldVNode.type) {
    unmountVNodeAndDestroyDom(oldVNode);

    oldVNode = EMPTY_OBJ;
    if (newVNodeISNULL) return null;
  }

  if (!newVNodeISNULL) {
    newType = newVNode.type;
    isComplex = isFn(newType);
    /**Prevention against json injection */
    if (!isValidVNode(newVNode)) {
      return null;
    }
  }
  if (!oldVNodeISNULL) {
    oldType = oldVNode.type;
  }
  /**strict equality,  leave diffing */
  if (newVNode === oldVNode) {
    return newVNodeISNULL ? null : newVNode._dom;
  }

  if (newType === oldType && isComplex) {
    /** preserve component state and instance */
    newVNode._component = oldVNode._component;
  }

  const tmp = newVNode;
  /** normalize VNode.props.children */
  newVNode._children = flattenVNodeChildren(newVNode);
  /** if we have a function/class Component, get the next rendered VNode */
  newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);

  if (isFn(oldVNode.type)) {
    oldVNode = oldVNode._renders;
  }

  if (newVNode == null || newVNode !== tmp) {
    /** toSimpleVNode gave us a null, unmount the vnode or it gave us a function.
     * - simplify our vnode again  */

    return diff(newVNode, oldVNode, parentDom, force, meta);
  }
  /** If we reached here, our component is either a Fragment or a simple dom node */
  oldType = oldVNode.type;
  newType = newVNode.type;
  updateParentDomPointers(newVNode, parentDom);
  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
    return;
  }
  let needsAppending: boolean = true;

  if (oldType === newType) {
    diffDomNode(newVNode, oldVNode);
    diffChildren(newVNode, oldVNode, newVNode._dom, meta);
    needsAppending = false;
  } else {
    diffDomNode(newVNode, null);

    diffChildren(newVNode, null, newVNode._dom, meta);
  }
  flushChangesToDomIfNeeded(newVNode, parentDom, needsAppending);
  unmountVNodeAndDestroyDom(oldVNode, true);
  return newVNode._dom;
}
