import { diffStyle, $ } from "./diff/dom";
import { DOMOps, UIElement } from "./types/index";
import {
  BATCH_MODE_APPEND_CHILD,
  BATCH_MODE_INSERT_BEFORE,
  BATCH_MODE_SET_ATTRIBUTE,
  BATCH_MODE_SET_STYLE,
  BATCH_MODE_REMOVE_ELEMENT,
} from "./constants";

export function commitDOMOps(queue: DOMOps[]) {
  const queueLen = queue.length;
  for (let i = 0; i < queueLen; i++) {
    const op = queue[i];
    const dom = op.node;
    const action = op.action;
    const refDom = op.refDom;
    const value = op.value;
    switch (action) {
      case BATCH_MODE_APPEND_CHILD:
        refDom.appendChild(dom);
        break;
      case BATCH_MODE_INSERT_BEFORE:
        (value as Node).insertBefore(dom, refDom);
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
