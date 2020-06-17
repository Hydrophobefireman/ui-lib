import {
  VNode,
  UIElement,
  DiffMeta,
  RenderedDom,
  WritableProps,
} from "../types/index";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";
import { Fragment } from "../create_element";
import {
  EMPTY_OBJ,
  BATCH_MODE_REMOVE_ELEMENT,
  LIFECYCLE_WILL_UNMOUNT,
} from "../constants";
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
      name: LIFECYCLE_WILL_UNMOUNT,
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
    const dom = VNode._dom as RenderedDom;
    if (dom != null) {
      /*#__NOINLINE__*/
      clearDomNodePointers(dom);
      meta.batch.push({ node: dom, action: BATCH_MODE_REMOVE_ELEMENT });
    }
  }
  clearVNodePointers(VNode);
}
const DOM_POINTERS: Record<
  Exclude<keyof UIElement, keyof HTMLElement | keyof Text>,
  number
> = {
  _VNode: 1,
  _events: 1,
};
export function clearDomNodePointers(dom: UIElement) {
  _clearPointers(DOM_POINTERS, dom);
}

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

export function clearVNodePointers(VNode: VNode) {
  if (VNode == null) return;

  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj: object, el: any) {
  if (el == null) return;
  for (const i in pointersObj) {
    el[i] = null;
  }
}
