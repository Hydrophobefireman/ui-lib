import { VNode, UIElement, Props } from "../types";
import { EMPTY_OBJ, isListener, getClosestDom } from "../util";
import { diffEventListeners } from "./events";

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
  dom._VNode = newVNode;

  diffAttributes(dom, newVNode, oldVNode === EMPTY_OBJ ? null : oldVNode);

  updateInternalVNodes(newVNode, "_dom", dom, "_renders");
  updateInternalVNodes(newVNode, "_dom", dom, "_renderedBy");

  setComponent_base(newVNode, dom);
}

function setComponent_base(VNode: VNode, dom: UIElement) {
  if (!VNode) return;
  if (VNode._component != null) {
    /** set the base value of the first component we find while travelling up the tree */
    VNode._component.base = dom;
  } else {
    setComponent_base(VNode._renderedBy, dom);
  }
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

function getFragParentSibDom(VNode: VNode) {
  const fp = VNode._fragmentParent;
  return fp && fp._nextSibDomVNode;
}

export function flushChangesToDomIfNeeded(
  newVNode: VNode,
  parentDom: Node,
  needsAppending: boolean
) {
  const nextSibVNode =
    newVNode._nextSibDomVNode || getFragParentSibDom(newVNode);
  const nextSibDomNode = getClosestDom(nextSibVNode);
  const domToPlace = newVNode._dom;
  if (!domToPlace) return;
  if (needsAppending) {
    appendNodeToDocument(domToPlace, nextSibDomNode, parentDom);
    updatePointers(newVNode);
  }
}

export function appendNodeToDocument(
  domToPlace: UIElement | DocumentFragment,
  nextSibDomNode: UIElement,
  parentDom: Node
) {
  let shouldAppend: boolean = true;
  let insertBefore: Node;
  if (nextSibDomNode) {
    shouldAppend = false;
    insertBefore = nextSibDomNode;
  }
  if (!shouldAppend && insertBefore) {
    parentDom.insertBefore(domToPlace, insertBefore);
  } else {
    parentDom.appendChild(domToPlace);
  }
}

function updatePointers(newVNode: VNode) {
  const dom = newVNode._dom;
  /** we get the parent dom from the actual element instead as it could be null (when we are reordering) */
  if (newVNode._parentDom == null) {
    updateParentDomPointers(newVNode, dom.parentNode);
  }
  const nextSib = dom.nextSibling as UIElement;
  const prevSib = dom.previousSibling as UIElement;

  if (nextSib != null) {
    updateAdjacentElementPointers(nextSib._VNode, dom, "_nextSibDomVNode");
    updateAdjacentElementPointers(newVNode, nextSib, "_prevSibDomVNode");
  }
  if (prevSib != null) {
    updateAdjacentElementPointers(newVNode, prevSib, "_nextSibDomVNode");
    updateAdjacentElementPointers(prevSib._VNode, dom, "_prevSibDomVNode");
  }
}

export function updateAdjacentElementPointers(
  VNode: VNode,
  nextSib: UIElement,
  propVal: "_prevSibDomVNode" | "_nextSibDomVNode"
) {
  if (!nextSib) return;
  const sibVNode = nextSib._VNode;
  if (!sibVNode) return;

  updateInternalVNodes(sibVNode, propVal, VNode, "_renders");
  updateInternalVNodes(sibVNode, propVal, VNode, "_renderedBy");
}

const replaceOtherProp = {
  _dom: "_FragmentDomNodeChildren",
  _FragmentDomNodeChildren: "_dom",
};

export function updateInternalVNodes(
  VNode: VNode,
  prop: string,
  val: any,
  nextGetter: "_renders" | "_renderedBy"
) {
  let next = VNode;
  const replace = replaceOtherProp[prop];
  if (next) {
    const fragParent = VNode._fragmentParent;
    if (shouldMirrorPropOnFragmentParent(fragParent, prop, val)) {
      fragParent[prop] = val;
    }
    if (replace) {
      next[replace] = null;
    }
    next[prop] = val;
    return updateInternalVNodes(next[nextGetter], prop, val, nextGetter);
  }
}
function shouldMirrorPropOnFragmentParent(
  fragParent: VNode,
  prop: string,
  val: any
): boolean {
  return (
    fragParent != null &&
    (prop === "_nextSibDomVNode" || prop === "_prevSibDomVNode") &&
    (val == null || isNotACommonChild(val, fragParent))
  );
}

function isNotACommonChild(val: VNode, fragParent: VNode) {
  if (val._fragmentParent === fragParent) {
    return false;
  }
  while ((val = val._fragmentParent)) {
    if (val._fragmentParent === fragParent) return false;
  }
  return true;
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

export function updateParentDomPointers(VNode: VNode, dom: Node) {
  if (dom == null) return;

  updateInternalVNodes(VNode, "_parentDom", dom, "_renderedBy");
}
