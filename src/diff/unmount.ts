import { VNode, UIElement, DiffMeta } from "../types";
import { EMPTY_OBJ } from "../util";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";
import { Fragment } from "../create_element";
import { copyPropsOverEntireTree } from "./dom";
import { MODE_REMOVE_CHILD } from "../commit";
import { setRef } from "../ref";

export function unmountVNodeAndDestroyDom(VNode: VNode, meta: DiffMeta): void {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;
  setRef(VNode.ref, null);
  unmountVNodeAndDestroyDom(VNode._renders, meta);
  const component = VNode._component;
  if (component != null) {
    /** maybe disable setState for this component? */
    component.setState = Fragment;
    component.forceUpdate = Fragment;
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
      unmountVNodeAndDestroyDom(child, meta);
    }
  }

  /*#__NOINLINE__*/
  _processNodeCleanup(VNode, meta);
}
function _processNodeCleanup(VNode: VNode, meta: DiffMeta) {
  if (typeof VNode.type !== "function") {
    const dom = VNode._dom;
    if (dom != null) {
      /*#__NOINLINE__*/
      clearDomNodePointers(dom);
      /*#__NOINLINE__*/

      meta.batch.push({ node: dom, action: MODE_REMOVE_CHILD });
    }
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
  if (VNode == null) return;

  let next = VNode._nextSibDomVNode;
  if (next != null) {
    const nextDom = next._dom;
    const newPrevSib = nextDom && (nextDom.previousSibling as UIElement);
    copyPropsOverEntireTree(
      next,
      "_prevSibDomVNode",
      newPrevSib && newPrevSib._VNode
    );
  }
  const prev = VNode._prevSibDomVNode;
  if (prev != null) {
    const prevDom = prev._dom;
    const newNextSib = prevDom && (prevDom.nextSibling as UIElement);
    copyPropsOverEntireTree(
      prev,
      "_nextSibDomVNode",
      newNextSib && newNextSib._VNode
    );
  }

  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj: object, el: any) {
  if (el == null) return;
  for (const i in pointersObj) {
    el[i] = null;
  }
}
