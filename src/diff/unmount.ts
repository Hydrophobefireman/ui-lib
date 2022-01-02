import {
  BATCH_MODE_CLEAR_POINTERS,
  BATCH_MODE_REMOVE_ATTRIBUTE,
  BATCH_MODE_REMOVE_ELEMENT,
  EMPTY_OBJ,
  Fragment,
  LIFECYCLE_WILL_UNMOUNT,
} from "../constants";
import {UIElement, VNode} from "../types/index";

import config from "../config";
import {scheduleLifeCycleCallbacks} from "../lifeCycleCallbacks";
import {setRef} from "../ref";
import {domOp} from "../commit";

function warnSetState() {
  config.warnOnUnmountRender &&
    console.warn("Component state changed after unmount", this);
}

export function unmount(VNode: VNode, recursionLevel?: number): void {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;
  recursionLevel =
    VNode.type === Fragment || typeof VNode.props === "string"
      ? -1
      : recursionLevel || 0;

  setRef(VNode.ref, null);
  unmount(VNode._renders, recursionLevel);

  const component = VNode._component;
  if (component != null) {
    /** maybe disable setState for this component? */
    component.setState = warnSetState;
    component.forceUpdate = warnSetState;
    /** todo check for side effects */
    component._VNode = null;

    scheduleLifeCycleCallbacks({
      name: LIFECYCLE_WILL_UNMOUNT,
      bind: component,
    });
  }

  const childArray = VNode._children;

  _processNodeCleanup(VNode, recursionLevel);

  if (childArray) {
    const cl = childArray.length;
    for (let i = 0; i < cl; i++) {
      const child: VNode = childArray[i];
      unmount(child, recursionLevel + 1);
    }
    childArray.length = 0;
  }

  /*#__NOINLINE__*/
}
function isSimplestVNode(VNode: VNode) {
  return typeof VNode.type != "function";
}
function _processNodeCleanup(VNode: VNode, recursionLevel: number) {
  let dom: UIElement;
  if (isSimplestVNode(VNode)) {
    dom = VNode._dom;
    if (dom != null) {
      clearListeners(VNode, dom);
      domOp({
        node: dom,
        action:
          recursionLevel > 0
            ? /** if the parent element is already being unmounted, all we need to do is
            clear the child element's listeners
             */
              BATCH_MODE_CLEAR_POINTERS
            : BATCH_MODE_REMOVE_ELEMENT,
        VNode,
      });
    }
  } else {
    domOp({action: BATCH_MODE_CLEAR_POINTERS, VNode, node: dom});
  }
}

function clearListeners(VNode: VNode, dom: UIElement) {
  const props = VNode.props;
  for (const prop in props) {
    if (prop[0] === "o" && prop[1] === "n") {
      domOp({
        action: BATCH_MODE_REMOVE_ATTRIBUTE,
        node: dom,
        attr: prop,
      });
    }
  }
}
