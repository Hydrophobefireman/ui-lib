import { $, diffStyle } from "./diff/dom";
import {
  BATCH_MODE_PLACE_NODE,
  BATCH_MODE_REMOVE_ELEMENT,
  BATCH_MODE_SET_ATTRIBUTE,
  BATCH_MODE_SET_STYLE,
  BATCH_MODE_REMOVE_ATTRIBUTE_NS,
  BATCH_MODE_SET_SVG_ATTRIBUTE,
  IS_SVG_ATTR,
  BATCH_MODE_CLEAR_POINTERS,
} from "./constants";
import { DOMOps, UIElement, VNode, WritableProps } from "./types/index";

export function commitDOMOps(queue: DOMOps[]) {
  const queueLen = queue.length;
  for (let i = 0; i < queueLen; i++) {
    const op = queue[i];
    const dom = op.node;
    const action = op.action;
    const refDom = op.refDom;
    const value = op.value;
    const VNode = op.VNode;
    let attr = op.attr;
    switch (action) {
      case BATCH_MODE_PLACE_NODE:
        (value as Node).insertBefore(dom, refDom);
        break;
      case BATCH_MODE_SET_ATTRIBUTE:
        // in case of removeAttribute, `op.attr===undefined`
        $(dom, attr, value);
        break;
      case BATCH_MODE_SET_STYLE:
        diffStyle(dom as UIElement, value.newValue, value.oldValue);
        break;
      case BATCH_MODE_REMOVE_ELEMENT:
        removeNode(dom);
        removePointers(VNode, dom);
        break;
      case BATCH_MODE_CLEAR_POINTERS:
        removePointers(VNode, dom);
        break;
      case BATCH_MODE_REMOVE_ATTRIBUTE_NS:
        dom.removeAttributeNS("http://www.w3.org/1999/xlink", attr);
        break;
      case BATCH_MODE_SET_SVG_ATTRIBUTE:
        const isSVGSpecificAttr =
          attr !== (attr = attr.replace(IS_SVG_ATTR, ""));

        isSVGSpecificAttr
          ? dom.setAttributeNS(
              "http://www.w3.org/1999/xlink",
              attr.toLowerCase(),
              value
            )
          : $(dom, attr, value, true);
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
function removePointers(VNode: VNode, dom: UIElement) {
  clearDomNodePointers(dom);
  clearVNodePointers(VNode);
}
const DOM_POINTERS: Record<
  Exclude<keyof UIElement, keyof HTMLElement | keyof Text>,
  number
> = {
  _VNode: 1,
  _events: 1,
};

const VNode_POINTERS: Record<
  WritableProps | "_children" | "_depth" | "key" | "ref",
  1 | null
> = {
  _children: 1,
  _component: 1,
  _depth: 1,
  _dom: 1,
  _renderedBy: 1,
  _renders: 1,
  _parentDom: 1,
  key: 1,
  ref: 1,
};

function clearDomNodePointers(dom: UIElement) {
  _clearPointers(DOM_POINTERS, dom);
}
function clearVNodePointers(VNode: VNode) {
  if (VNode == null) return;

  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj: object, el: any) {
  if (el == null) return;
  for (const i in pointersObj) {
    el[i] = null;
  }
}
