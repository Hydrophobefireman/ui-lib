import { updatePointers, diffStyle, $ } from "./diff/dom";
import { DOMOps, UIElement } from "./types";

export const MODE_APPEND_CHILD = 0;
export const MODE_REMOVE_CHILD = 1;
export const MODE_INSERT_BEFORE = 2;
export const MODE_SET_ATTRIBUTE = 3;
export const MODE_REMOVE_ATTRIBUTE = 4;

export const MODE_SET_STYLE = 5;

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
      case MODE_APPEND_CHILD:
        refDom.appendChild(dom);
        updatePointers(VNode);
        break;
      case MODE_INSERT_BEFORE:
        (value as Node).insertBefore(dom, refDom);
        updatePointers(VNode);
        break;
      case MODE_REMOVE_ATTRIBUTE:
      case MODE_SET_ATTRIBUTE:
        // in case of removeAttribute, `op.attr===undefined`
        $(dom, op.attr, value);
        break;
      case MODE_SET_STYLE:
        diffStyle(dom as UIElement, value.newValue, value.oldValue);
        break;
      case MODE_REMOVE_CHILD:
        removeNode(dom);
        break;
      default:
        break;
    }
  }
  queue.length = 0;
}

function removeNode(dom: UIElement) {
  if (dom == null) return;
  const p = dom.parentNode;
  if (p) {
    p.removeChild(dom);
  }
}
