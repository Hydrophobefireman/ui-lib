import { VNode, UIElement } from "../types";
import { EMPTY_OBJ } from "../util";
import { diffEventListeners } from "./events";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";
import { Fragment, PlaceHolder } from "../create_element";

export function unmountVNodeAndDestroyDom(
  VNode: VNode,
  skipRemove?: boolean
): void {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;
  unmountVNodeAndDestroyDom(VNode._renders, skipRemove);
  const component = VNode._component;
  if (!skipRemove && component != null) {
    /** maybe disable setState for this component? */
    component.setState = Fragment;
    /** todo check for side effects */
    component._VNode = null;
    scheduleLifeCycleCallbacks({
      name: "componentWillUnmount",
      bind: component,
    });
  }

  let child: VNode;
  const childArray = VNode._children;
  if (childArray) {
    while (childArray.length) {
      child = childArray.pop();
      unmountVNodeAndDestroyDom(child, skipRemove);
    }
  }

  /*#__NOINLINE__*/
  _processNodeCleanup(VNode, skipRemove);
}
function _processNodeCleanup(VNode: VNode, skip?: boolean) {
  const isPlaceholder = VNode.type === PlaceHolder;
  const dom = VNode._dom;
  if (!skip && dom != null) {
    /*#__NOINLINE__*/
    !isPlaceholder && diffEventListeners(dom, null, VNode.events);
    /*#__NOINLINE__*/
    clearDomNodePointers(dom);
    /*#__NOINLINE__*/
    removeNode(dom);
  }

  clearVNodePointers(VNode);
}
const DOM_POINTERS = { _VNode: 1, _listeners: 1, onclick: 1 };
export function clearDomNodePointers(dom: UIElement) {
  _clearPointers(DOM_POINTERS, dom);
}

const VNode_POINTERS: {} = {
  events: 1,
  _FragmentDomNodeChildren: 1,
  _children: 1,
  _component: 1,
  _depth: 1,
  _dom: 1,
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1,
  _renderedBy: 1,
  _renders: 1,
  _parentDom: 1,
} as { [key in keyof VNode<any>]: 1 | null };

export function clearVNodePointers(VNode: VNode) {
  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj: object, el: any) {
  if (el == null) return;
  for (const i in pointersObj) {
    el[i] = null;
  }
}

function removeNode(dom: UIElement) {
  if (dom == null) return;
  const p = dom.parentNode;
  if (p) {
    p.removeChild(dom);
  }
}