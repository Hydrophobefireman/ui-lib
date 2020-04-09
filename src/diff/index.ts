import { VNode, ComponentType } from "../types";
import { EMPTY_OBJ } from "../util";
import { unmountVNodeAndDestroyDom } from "./updater";
import { Fragment, flattenVNodeChildren } from "../create_element";
import { diffChildren } from "./children";
import {
  diffDomNode,
  flushChangesToDomIfNeeded,
  __updateInternalVnodes,
} from "./dom";
import { toSimpleVNode, isFn } from "../toSimpleVNode";

export function diff(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom?: Node,
  force?: boolean,
  meta?: { depth: number }
) {
  const newVnodeISNULL = newVNode == null;
  const oldVNodeISNULL = oldVNode == null;
  let oldType: string | ComponentType;
  let newType: string | ComponentType;
  if (!newVnodeISNULL && !oldVNodeISNULL) {
    oldType = oldVNode.type;
    newType = newVNode.type;
    if (!newVNode._nextSibDomVnode)
      newVNode._nextSibDomVnode = oldVNode._nextSibDomVnode;
    if (newType === oldType) {
      newVNode._component = oldVNode._component;
    }
  }
  if (newVNode === EMPTY_OBJ) return;

  // oldVNode = getFinalVnode(oldVNode);
  if (newVNode === oldVNode)
    return; /**@NOTE remember to convert your vnode to simplest form before calling diff */
  if (typeof newVNode === "boolean") newVNode = null;
  if (newVnodeISNULL || oldVNodeISNULL || newVNode.type !== oldVNode.type) {
    unmountVNodeAndDestroyDom(oldVNode);
    oldVNode = EMPTY_OBJ;
    if (newVnodeISNULL) return null;
  }
  if (newVNode.__self !== newVNode) {
    console.warn("component not of expected type =>", newVNode);
    return null;
  }

  if (newVNode._parentDom == null) {
    const pd = parentDom || oldVNode._parentDom;
    newVNode._parentDom = !(pd instanceof DocumentFragment) ? pd : null;
  }
  newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);
  newVNode._children = flattenVNodeChildren(newVNode);

  oldVNode = oldVNode._renders || oldVNode;
  if (newVNode == null || isFn(newVNode.type)) {
    return diff(newVNode, oldVNode, parentDom, force, meta);
  }

  oldType = oldVNode.type;
  newType = newVNode.type;
  if (newType == Fragment) {
    /** && newVnodeType===Fragment (will be true) */
    diffChildren(newVNode, oldVNode, parentDom, meta);
    return;
  }
  let needsAppending: boolean = true;
  let docFrag: DocumentFragment = null;
  if (oldType === newType) {
    // newVNode._component = oldVNode._component;
    diffDomNode(newVNode, oldVNode);
    diffChildren(newVNode, oldVNode, newVNode._dom, meta);
    needsAppending = !!newVNode._nextSibDomVnode;
  } else {
    const _prevSibDomVnode = oldVNode._prevSibDomVnode;
    const propPSD = "_prevSibDomVnode";
    const propNSD = "_nextSibDomVnode";

    __updateInternalVnodes(newVNode, propPSD, _prevSibDomVnode, "_renders");
    __updateInternalVnodes(newVNode, propPSD, _prevSibDomVnode, "_renderedBy");

    const _nextSibDomVnode = oldVNode._nextSibDomVnode;
    __updateInternalVnodes(newVNode, propNSD, _nextSibDomVnode, "_renders");
    __updateInternalVnodes(newVNode, propNSD, _nextSibDomVnode, "_renderedBy");

    diffDomNode(newVNode, null);
    diffChildren(newVNode, null, newVNode._dom, meta);
  }
  const fragLikeDom = newVNode._FragmentDomNodeChildren;
  if (fragLikeDom && fragLikeDom.length) {
    docFrag = document.createDocumentFragment();
    fragLikeDom.forEach((dom) => docFrag.appendChild(dom));
  }
  flushChangesToDomIfNeeded(newVNode, parentDom, docFrag, needsAppending);
  return newVNode._dom;
}
