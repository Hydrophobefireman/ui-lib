import { DiffMeta, RenderedDom, VNode } from "../types/index";
import { EMPTY_OBJ, NULL_TYPE } from "../constants";
import { Fragment, flattenVNodeChildren } from "../create_element";
import { diffChildren, getDom } from "./children";
import { isFn, toSimpleVNode } from "../toSimpleVNode";

import { diffDomNodes } from "./dom";
import { diffReferences } from "../ref";
import { isValidVNode } from "../util";
import { unmountVNodeAndDestroyDom } from "./unmount";

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
  parentDom: HTMLElement,
  force: boolean,
  meta: DiffMeta
): RenderedDom | RenderedDom[] {
  if (newVNode == null || typeof newVNode === "boolean") {
    unmountVNodeAndDestroyDom(oldVNode, meta);
    return;
  }

  if (!isValidVNode(newVNode)) {
    return null;
  }
  if (oldVNode === newVNode) {
    return newVNode._dom;
  }
  oldVNode = oldVNode || EMPTY_OBJ;
  let oldType: VNode["type"] = oldVNode.type;
  let newType: VNode["type"] = newVNode.type;

  let isComplex = isFn(newType);

  if (newType === oldType && isComplex) {
    newVNode._component = oldVNode._component;
  }
  newVNode._parentDom = parentDom;

  if (newType !== oldType) {
    // type differs, either different dom nodes or different function/class components
    if (!meta.next) {
      const next = getDom(oldVNode);
      meta.next = (next || EMPTY_OBJ).nextSibling;
    }
    unmountVNodeAndDestroyDom(oldVNode, meta);
    oldVNode = EMPTY_OBJ;
  }
  const tmp = newVNode;
  if (typeof newVNode.props !== "string" && newType !== NULL_TYPE) {
    /** if we have a function/class Component, get the next rendered VNode */
    newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);
  }

  if (isFn(oldVNode.type)) {
    // also get the next rendered VNode from the old VNode
    oldVNode = oldVNode._renders;
  }
  if (newVNode !== tmp) {
    /** SCU returned False */
    if (newVNode === EMPTY_OBJ) return;
    // we received a new VNode from calling Component.render, start a new diff
    return diff(newVNode, oldVNode, parentDom, force, meta);
  }
  /** normalize VNode.props.children */
  newVNode._children = flattenVNodeChildren(newVNode);

  oldType = oldVNode.type;
  newType = newVNode.type;

  let dom: RenderedDom;
  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
  } else {
    if (oldType !== newType) {
      oldVNode = null;
    }
    diffDomNodes(newVNode, oldVNode, parentDom, meta);
    dom = newVNode._dom as RenderedDom;
    diffChildren(newVNode, oldVNode, dom, meta);
    diffReferences(newVNode, oldVNode, dom);
  }
  return dom;
}
