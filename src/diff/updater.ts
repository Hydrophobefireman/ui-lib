import { VNode, UIElement } from "../types";
import { EMPTY_OBJ, EMPTY_ARR } from "../util";
import { diffEventListeners } from "./events";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";
import { Fragment } from "../create_element";

export function unmountVNodeAndDestroyDom(VNode: VNode): void {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;

  const component = VNode._component;
  if (component) {
    /** maybe disable setState for this component? */
    component.setState = Fragment;
    /** todo check for side effects */

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
      unmountVNodeAndDestroyDom(child);
    }
  }

  const fragChildren = VNode._FragmentDomNodeChildren;
  unmountFragChildren(fragChildren);

  unmountNextRenderedVNode(VNode);

  const dom = VNode._dom;
  _processNodeCleanup(dom, VNode);
}

function unmountFragChildren(fragChildren: VNode["_FragmentDomNodeChildren"]) {
  if (fragChildren) {
    let fragChild: UIElement | UIElement[];
    while (fragChildren.length) {
      fragChild = fragChildren.pop() as UIElement;
      if (fragChild != null) {
        if (Array.isArray(fragChild)) {
          unmountFragChildren(fragChild);
        } else {
          unmountVNodeAndDestroyDom(fragChild._VNode);
        }
      }
    }
  }
}
function unmountNextRenderedVNode(VNode: VNode): void {
  if (!VNode) return;
  let nextVNode = VNode;
  while ((nextVNode = nextVNode._renders)) {
    unmountVNodeAndDestroyDom(nextVNode);
  }
}

/* #__NOINLINE__ */
function _processNodeCleanup(dom: UIElement, VNode: VNode) {
  diffEventListeners(dom, null, VNode.events);

  clearDomNodePointers(dom);

  removeNode(dom);

  clearSibDomPointers(VNode);
  clearVNodePointers(VNode);
}

function clearSibDomPointers(VNode: VNode) {
  let nextVNode: VNode = VNode;

  while ((nextVNode = nextVNode._renders)) {
    const prevSibDomVNode = nextVNode._prevSibDomVNode;
    const nextSibDomVNode = nextVNode._nextSibDomVNode;

    prevSibDomVNode && (prevSibDomVNode._nextSibDomVNode = null);
    nextSibDomVNode && (nextSibDomVNode._prevSibDomVNode = null);
  }
}

const DOM_POINTERS = { _VNode: 1, _listeners: 1 };
export function clearDomNodePointers(dom: UIElement) {
  _clearPointers(DOM_POINTERS, dom);
}

const VNode_POINTERS = {
  _FragmentDomNodeChildren: 1,
  _children: 1,
  _component: 1,
  _depth: 1,
  _dom: 1,
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1,
  _renderedBy: 1,
  _renders: 1,
  _fragmentParent: 1,
};

export function clearVNodePointers(VNode: VNode) {
  if (VNode != null) {
    const fp = VNode._fragmentParent;
    if (fp != null) {
      if (fp._nextSibDomVNode === VNode) {
        fp._nextSibDomVNode = null;
      } else if (fp._prevSibDomVNode === VNode) {
        fp._prevSibDomVNode = null;
      }
    }
  }
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
