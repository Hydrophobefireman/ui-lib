import { diffStyle, $ } from "./diff/dom";
import { DOMOps, UIElement, VNode } from "./types/index";
import {
  BATCH_MODE_APPEND_CHILD,
  BATCH_MODE_INSERT_BEFORE,
  BATCH_MODE_SET_ATTRIBUTE,
  BATCH_MODE_SET_STYLE,
  BATCH_MODE_REMOVE_ELEMENT,
} from "./constants";
import { copyPropsOverEntireTree } from "./VNodePointers";
import { clearDomNodePointers } from "./diff/unmount";

export function commitDOMOps(queue: DOMOps[]) {
  const queueLen = queue.length;
  for (let i = 0; i < queueLen; i++) {
    const op = queue[i];
    const dom = op.node;
    const action = op.action;
    const refDom = op.refDom;
    const value = op.value;
    const VNode = op.VNode;
    switch (action) {
      case BATCH_MODE_APPEND_CHILD:
        refDom.appendChild(dom);
        updatePointers(VNode);
        break;
      case BATCH_MODE_INSERT_BEFORE:
        (value as Node).insertBefore(dom, refDom);
        updatePointers(VNode);
        break;
      case BATCH_MODE_SET_ATTRIBUTE:
        // in case of removeAttribute, `op.attr===undefined`
        $(dom, op.attr, value);
        break;
      case BATCH_MODE_SET_STYLE:
        diffStyle(dom as UIElement, value.newValue, value.oldValue);
        break;
      case BATCH_MODE_REMOVE_ELEMENT:
        removeNode(dom);
        clearDomNodePointers(dom);
        break;
      default:
        break;
    }
  }
  // queue is immutable, we build a new one everytime
  //   queue.length = 0;
}

function removeNode(dom: UIElement) {
  if (dom == null) return;
  const p = dom.parentNode;
  if (p) {
    p.removeChild(dom);
  }
}
function updatePointers(newVNode: VNode) {
  const dom = newVNode._dom;

  let sn = newVNode._nextSibDomVNode;

  if (sn == null) {
    const nextSib = dom.nextSibling as UIElement;
    if (nextSib != null) {
      sn = nextSib._VNode;
    }
  }

  copyPropsOverEntireTree(sn, "_prevSibDomVNode", newVNode);

  copyPropsOverEntireTree(newVNode, "_nextSibDomVNode", sn);

  let pn = newVNode._prevSibDomVNode;

  if (pn == null) {
    const prevSib = dom.previousSibling as UIElement;

    if (prevSib != null) {
      pn = prevSib._VNode;
    }
  }

  copyPropsOverEntireTree(pn, "_nextSibDomVNode", newVNode);

  copyPropsOverEntireTree(newVNode, "_prevSibDomVNode", pn);
}
