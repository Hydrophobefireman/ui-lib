import { VNode, UIElement, Props } from "../types";
import { EMPTY_OBJ, isListener } from "../util";
import { diffEventListeners } from "./events";
import { getFinalVnode } from "../util";

export function diffDomNode(newVNode: VNode, oldVNode: VNode) {
  oldVNode = oldVNode || EMPTY_OBJ;
  const newType = newVNode.type;
  const oldType = oldVNode.type;
  let dom: UIElement;
  const oldDom = oldVNode._dom;

  if (newType !== oldType || oldDom == null) {
    dom = createDomFromVNode(newVNode);
  } else {
    dom = oldDom;
  }
  diffAttributes(dom, newVNode, oldVNode === EMPTY_OBJ ? null : oldVNode);
  dom._VNode = newVNode;
  __updateInternalVnodes(newVNode, "_dom", dom, "_renders");
  // __updateInternalVnodes(newVNode, "_dom", dom, "_renderedBy");
}

function createDomFromVNode(newVNode: VNode): UIElement {
  if (typeof newVNode.props === "string") {
    return (document.createTextNode("") as unknown) as UIElement;
  } else {
    return document.createElement(newVNode.type as string) as UIElement;
  }
}

function diffAttributes(
  dom: UIElement,
  newVNode: VNode,
  oldVNode: VNode | null
) {
  oldVNode = oldVNode || EMPTY_OBJ;
  const isTextNode = typeof newVNode.props === "string";
  if (isTextNode) {
    return __diffTextNodes(
      dom,
      (newVNode.props as unknown) as string,
      (oldVNode.props as unknown) as string
    );
  }
  const prevAttrs = oldVNode.props || EMPTY_OBJ;
  const nextAttrs = newVNode.props;
  if (prevAttrs != null) {
    __removeOldAttributes(dom, prevAttrs, nextAttrs);
  }
  __diffNewAttributes(dom, prevAttrs, nextAttrs);
  diffEventListeners(dom, newVNode.events, oldVNode.events);
}
const UNSAFE_ATTRS = { key: 1, ref: 1, children: 1 };
function isUnsafeAttr(attr: string): boolean {
  return attr in UNSAFE_ATTRS;
}

function __diffNewAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>
) {
  for (let attr in next) {
    if (isListener(attr) || isUnsafeAttr(attr)) continue;
    let newValue = next[attr];
    let oldValue = prev[attr];
    if (newValue === oldValue) continue;
    attr = attr === "class" ? "className" : attr;
    if (attr === "className") {
      diffClass(dom, newValue, oldValue);
      continue;
    } else if (attr === "style") {
      diffStyle(dom, newValue, oldValue);
      continue;
    }
    $(dom, attr, newValue);
  }
}

function diffStyle(
  dom: UIElement,
  newValue: string | object,
  oldValue: string | object
) {
  oldValue = oldValue || "";
  const st = dom.style;
  if (typeof newValue === "string") {
    st.cssText = newValue;
    return;
  }
  const oldValueIsString = typeof oldValue === "string";
  if (oldValueIsString) {
    st.cssText = "";
  } else {
    for (const styleProp in oldValue as object) {
      if (!(styleProp in newValue)) {
        st[styleProp] = "";
      }
    }
  }
  for (const i in newValue) {
    const prop = newValue[i];
    if (oldValueIsString || prop !== oldValue[i]) {
      st[i] = prop;
    }
  }
}

function diffClass(
  dom: UIElement,
  newValue: string | string[],
  oldValue: string | string[]
) {
  const isArray = Array.isArray;
  if (isArray(newValue)) {
    newValue = newValue.join(" ").trim();
  }
  if (isArray(oldValue)) {
    oldValue = oldValue.join(" ").trim();
  }
  if (newValue === oldValue) return;
  $(dom, "className", newValue);
}

function __removeOldAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>
) {
  for (const i in prev) {
    if (!(i in next)) {
      $(dom, i, null);
    }
  }
}
function __diffTextNodes(dom: UIElement, newVal: string, oldVal: string) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}

export function flushChangesToDomIfNeeded(
  newVNode: VNode,
  parentDom: Node,
  docFrag?: DocumentFragment,
  needsAppending?: boolean
) {
  const nextSibVNode = getFinalVnode(newVNode._nextSibDomVnode);
  const nextSibDomNode = nextSibVNode
    ? nextSibVNode._dom || nextSibVNode._FragmentDomNodeChildren
    : null;
  //   const prevSibDomNode = newVNode._prevSibDomVnode;
  const domToPlace = docFrag || newVNode._dom;
  if (!domToPlace) return;
  if (needsAppending) {
    placeDomNodeAroundSibDomsifNeeded(
      domToPlace,
      nextSibDomNode,
      parentDom || newVNode._parentDom
    );
    updatePointers(newVNode, parentDom);
  }
}

export function placeDomNodeAroundSibDomsifNeeded(
  domToPlace: UIElement | DocumentFragment,
  nextSibDomNode: UIElement | (UIElement | Text)[],
  parentDom: Node
) {
  let shouldAppend: boolean = true;
  let insertBefore: Node;
  if (nextSibDomNode) {
    if (Array.isArray(nextSibDomNode)) {
      const ndom = getClosestDomElementFromFragmentChildren(nextSibDomNode);
      if (ndom) {
        shouldAppend = false;
        insertBefore = ndom;
      }
    } else {
      shouldAppend = false;
      insertBefore = nextSibDomNode;
    }
  }
  if (!shouldAppend && insertBefore) {
    parentDom.insertBefore(domToPlace, insertBefore);
  } else {
    parentDom.appendChild(domToPlace);
  }
}

function updatePointers(newVNode: VNode, parentDom: Node) {
  const dom = newVNode._docFrag || newVNode._dom;
  const nextSib = dom.nextSibling;
  const prevSib = dom.previousSibling;
  __updateInternalVnodes(newVNode, "_parentDom", parentDom, "_renders");
  __updateInternalVnodes(newVNode, "_parentDom", parentDom, "_renderedBy");
  updateVNodePropRecursively(
    newVNode,
    nextSib as UIElement,
    "_prevSibDomVnode"
  );
  updateVNodePropRecursively(
    newVNode,
    prevSib as UIElement,
    "_nextSibDomVnode"
  );
}

function updateVNodePropRecursively(
  VNode: VNode,
  nextSib: UIElement,
  propVal: "_prevSibDomVnode" | "_nextSibDomVnode"
) {
  if (!nextSib) return;
  const sibVnode = nextSib._VNode;
  if (!sibVnode) return;
  __updateInternalVnodes(sibVnode, propVal, VNode, "_renders");
  __updateInternalVnodes(sibVnode, propVal, VNode, "_renderedBy");
}

export function __updateInternalVnodes(
  VNode: VNode,
  prop: string,
  val: any,
  nextGetter: "_renders" | "_renderedBy"
) {
  let next = VNode;
  if (next) {
    next[prop] = val;
  }
  while ((next = next[nextGetter])) {
    next[prop] = val;
  }
}

type DomNodeLike = UIElement | Text | null;
export function getClosestDomElementFromFragmentChildren(
  nextDom: DomNodeLike | DomNodeLike[]
): DomNodeLike {
  if (Array.isArray(nextDom)) {
    for (let i = 0; i < nextDom.length; i++) {
      const next = nextDom[i];
      if (Array.isArray(next)) {
        return getClosestDomElementFromFragmentChildren(next);
      }
      if (next != null) return next;
    }
  } else {
    return nextDom;
  }
}

/** dom helper */
function $(dom: UIElement, key: string, value: any) {
  if (key in dom) {
    return (dom[key] = value == null ? "" : value);
  } else {
    if (value == null) return dom.removeAttribute(key);
    return dom.setAttribute(key, value);
  }
}
