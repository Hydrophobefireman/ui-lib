import {
  BATCH_MODE_REMOVE_ELEMENT,
  EMPTY_OBJ,
  LIFECYCLE_WILL_UNMOUNT,
  BATCH_MODE_REMOVE_ATTRIBUTE,
  BATCH_MODE_CLEAR_POINTERS,
} from "../constants";
import { DiffMeta, RenderedDom, VNode, UIElement } from "../types/index";

import { Fragment } from "../create_element";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";
import { setRef } from "../ref";

export function unmount(VNode: VNode, meta: DiffMeta): void {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;
  setRef(VNode.ref, null);
  unmount(VNode._renders, meta);

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

  const childArray = VNode._children;
  _processNodeCleanup(VNode, meta);

  if (childArray) {
    const cl = childArray.length;
    for (let i = 0; i < cl; i++) {
      const child: VNode = childArray[i];
      const node = child._dom;
      clearListeners(child, node, meta);
      meta.batch.push({
        action: BATCH_MODE_CLEAR_POINTERS,
        VNode: VNode,
        node,
      });
    }
    childArray.length = 0;
  }

  /*#__NOINLINE__*/
}
function _processNodeCleanup(VNode: VNode, meta: DiffMeta) {
  const type = VNode.type;
  if (typeof type !== "function") {
    const dom = VNode._dom as RenderedDom;
    if (dom != null) {
      clearListeners(VNode, dom, meta);
      meta.batch.push({
        node: dom,
        action: BATCH_MODE_REMOVE_ELEMENT,
        VNode: VNode,
      });
    }
  }
}

function clearListeners(VNode: VNode, dom: UIElement, meta: DiffMeta) {
  const props = VNode.props;

  for (const prop in props) {
    if (prop[0] === "o" && prop[1] === "n") {
      meta.batch.push({
        action: BATCH_MODE_REMOVE_ATTRIBUTE,
        node: dom,
        attr: prop,
      });
    }
  }
}
