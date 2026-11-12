import {BAILOUT, EMPTY_OBJ, Fragment, NULL_TYPE} from "../constants.js";
import {flattenVNodeChildren} from "../create_element.js";
import {diffReferences} from "../ref.js";
import {isFn, toSimpleVNode} from "../toSimpleVNode.js";
import type {DiffMeta, UIElement, VNode} from "../types/index.js";
import {isValidVNode} from "../util.js";
import {diffChildren, getDom} from "./children.js";
import {diffDomNodes} from "./dom.js";
import {unmount} from "./unmount.js";

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
): UIElement | UIElement[] {
  if (newVNode == null || typeof newVNode === "boolean") {
    unmount(oldVNode);
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
  newVNode._used = true;

  if (newType !== oldType) {
    // type differs, either different dom nodes or different function/class components
    if (!meta.next) {
      const next = getDom(oldVNode);
      meta.next = (next || EMPTY_OBJ).nextSibling;
    }
    unmount(oldVNode);
    oldVNode = EMPTY_OBJ;
  }
  const tmp = newVNode;
  if (typeof newVNode.props !== "string" && newType !== NULL_TYPE) {
    /** if we have a function/class Component, get the next rendered VNode */
    newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);
    if (newVNode === BAILOUT) {
      /** shouldComponentUpdate returned false; subtree is retained as-is */
      return;
    }
    meta.isSvg = newVNode.type === "svg" || meta.isSvg;
  }

  if (isFn(oldVNode.type)) {
    // also get the next rendered VNode from the old VNode
    oldVNode = oldVNode._renders;
  }
  if (newVNode !== tmp) {
    // we received a new VNode from calling Component.render, start a new diff
    return diff(newVNode, oldVNode, parentDom, force, meta);
  }
  /** normalize VNode.props.children */
  newVNode._children = flattenVNodeChildren(newVNode);

  oldType = oldVNode.type;
  newType = newVNode.type;
  if (oldType !== newType) {
    oldVNode = null;
  }
  let dom: UIElement;
  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
  } else {
    diffDomNodes(newVNode, oldVNode, parentDom, meta);
    dom = newVNode._dom as UIElement;
    meta.isSvg = newType != "foreignObject" && meta.isSvg;
    diffChildren(newVNode, oldVNode, dom, meta);
    diffReferences(newVNode, oldVNode, dom);
  }

  return dom;
}
