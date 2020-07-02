import {
  BATCH_MODE_REMOVE_ELEMENT,
  EMPTY_OBJ,
  LIFECYCLE_WILL_UNMOUNT,
  NULL_TYPE,
} from "../constants";
import { DiffMeta, RenderedDom, VNode } from "../types/index";

import { __removeOldAttributes as $removeOldAttributes } from "./dom";
import { Fragment } from "../create_element";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";
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
  const type = VNode.type;
  if (typeof type !== "function") {
    const dom = VNode._dom as RenderedDom;
    if (dom != null) {
      if (type !== NULL_TYPE && type != null) {
        $removeOldAttributes(dom, VNode.props, EMPTY_OBJ, meta);
      }
      meta.batch.push({
        node: dom,
        action: BATCH_MODE_REMOVE_ELEMENT,
        VNode: VNode,
      });
    }
  }
}
