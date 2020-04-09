import { VNode, UIElement } from "../types";
import { EMPTY_OBJ, EMPTY_ARR } from "../util";
import { diffEventListeners } from "./events";
import { scheduleLifeCycleCallbacks } from "../lifeCycleCallbacks";

export function unmountVNodeAndDestroyDom(VNode: VNode): void {
  if (VNode == null || VNode === EMPTY_OBJ) return;
  let child: VNode;
  const component = VNode._component;
  if (component)
    scheduleLifeCycleCallbacks({
      name: "componentWillUnmount",
      bind: component,
    });
  const childArray = VNode._children || EMPTY_ARR;
  while ((child = childArray.pop())) {
    unmountVNodeAndDestroyDom(child);
  }
  unmountNextRenderedVNode(VNode, "_renders");
  const dom = VNode._dom;
  const fragLikeDom = VNode._FragmentDomNodeChildren;
  if (dom) {
    _processNodeCleanup(dom, VNode);
  } else if (fragLikeDom) {
    fragLikeDom.forEach((dom: UIElement) =>
      _processNodeCleanup(dom, dom._VNode)
    );
  }
}

function unmountNextRenderedVNode(
  VNode: VNode,
  nextVNodeGetter: "_renders"
): void {
  if (!VNode) return;
  let nextVNode = VNode;
  let depth = 1;
  while ((nextVNode = nextVNode[nextVNodeGetter])) {
    unmountVNodeAndDestroyDom(nextVNode);
    depth + 1;
  }
}

function _processNodeCleanup(dom: UIElement, VNode: VNode) {
  diffEventListeners(dom, null, VNode.events);
  clearSibDomPointers(VNode);
  clearDomNodePointers(dom);
  clearVnodePointers(VNode);
  removeNode(dom);
}

function clearSibDomPointers(VNode: VNode) {
  let nextVnode: VNode = VNode;
  while ((nextVnode = nextVnode._renders)) {
    const prevSibDomVnode = nextVnode._prevSibDomVnode;
    const nextSibDomVnode = nextVnode._nextSibDomVnode;
    prevSibDomVnode && (prevSibDomVnode._nextSibDomVnode = null);
    nextSibDomVnode && (nextSibDomVnode._prevSibDomVnode = null);
  }
}

const DOM_POINTERS = { _VNode: 1, _listeners: 1 };
function clearDomNodePointers(dom: UIElement) {
  _clearPointers(DOM_POINTERS, dom);
}

const VNODE_POINTERS = {
  _dom: 1,
  _children: 1,
  _component: 1,
  _nextSibDomVnode: 1,
  _renders: 1,
  _renderedBy: 1,
  _prevSibDomVnode: 1,
  _FragmentDomNodeChildren: 1,
  _docFrag: 1,
  _parentDom: 1,
};

function clearVnodePointers(VNode: VNode) {
  _clearPointers(VNODE_POINTERS, VNode);
}
function _clearPointers(pointersObj: object, el: any) {
  for (const i in pointersObj) {
    el[i] = null;
  }
}

function removeNode(dom: UIElement) {
  const p = dom.parentNode;
  if (p) {
    p.removeChild(dom);
  }
}

// function setSibDomPointers(VNode: VNode, dom) {}
