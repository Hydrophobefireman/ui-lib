import { VNode, UIElement, Props } from "../types";
import { EMPTY_OBJ, isListener, getClosestDom } from "../util";
import { diffEventListeners } from "./events";
import { PlaceHolder, Fragment } from "../create_element";

export function diffDomNodes(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: Node
) {
  oldVNode = oldVNode || EMPTY_OBJ;
  const shouldAppend = oldVNode === EMPTY_OBJ;
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

  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode);
  copyPropsOverEntireTree(newVNode, "_dom", dom);
  setComponent_base(newVNode, dom);
  if (shouldAppend) {
    flushChangesToDomIfNeeded(newVNode, parentDom, true);
  }
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
    const type = newVNode.type;
    if (type === PlaceHolder) {
      return (document.createComment("") as any) as UIElement;
    }
    const dom = document.createElement(type as string) as UIElement;
    dom.onclick = Fragment;
    return dom;
  }
}

function diffAttributes(
  dom: UIElement,
  newVNode: VNode,
  oldVNode: VNode | null
) {
  if (newVNode.type === PlaceHolder) return;
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

const attrsToFetchFromDOM = { value: 1, checked: 1 };
function __diffNewAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>
) {
  for (let attr in next) {
    if (isListener(attr) || attr in UNSAFE_ATTRS) continue;
    let newValue = next[attr];
    let oldValue = attrsToFetchFromDOM[attr] ? dom[attr] : prev[attr];
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
  needsAppending: boolean
) {
  const nextSibVNode = newVNode._nextSibDomVNode;

  const nextSibDomNode = /*#__NOINLINE__*/ getClosestDom(nextSibVNode);
  const domToPlace = newVNode._dom;
  if (!domToPlace) return;
  if (needsAppending) {
    /*#__NOINLINE__*/
    appendNodeToDocument(domToPlace, nextSibDomNode, parentDom);
    /*#__NOINLINE__*/
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
  if (nextSibDomNode && nextSibDomNode !== domToPlace) {
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

  if (newVNode._parentDom == null) {
    updateParentDomPointers(newVNode, dom.parentNode);
  }

  let sn = newVNode._nextSibDomVNode;
  if (sn == null) {
    const nextSib = dom.nextSibling as UIElement;
    if (nextSib != null) {
      sn = nextSib._VNode;
    }
  }
  copyPropsOverEntireTree(sn, "_prevSibDomVNode", newVNode);
  copyPropsOverEntireTree(newVNode, "_nextSibDomVNode", sn);
  let pn = newVNode._prevSibDomVNode;
  if (pn == null) {
    const prevSib = dom.previousSibling as UIElement;
    if (prevSib != null) {
      pn = prevSib._VNode;
    }
  }
  copyPropsOverEntireTree(pn, "_nextSibDomVNode", newVNode);
  copyPropsOverEntireTree(newVNode, "_prevSibDomVNode", pn);
}

export function copyPropsOverEntireTree(
  VNode: VNode,
  propVal: keyof VNode,
  val: any
) {
  updateInternalVNodes(VNode, propVal, val, "_renders");
  updateInternalVNodes(VNode, propVal, val, "_renderedBy");
}
const replaceOtherProp = {
  _dom: "_FragmentDomNodeChildren",
  _FragmentDomNodeChildren: "_dom",
};

export function updateInternalVNodes(
  VNode: VNode,
  prop: keyof VNode,
  val: any,
  nextGetter: "_renders" | "_renderedBy"
) {
  let next = VNode;
  const replace = replaceOtherProp[prop];
  while (next) {
    if (replace) {
      next[replace] = null;
    }
    next[prop] = val;
    next = next[nextGetter];
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

export function updateParentDomPointers(VNode: VNode, dom: Node) {
  if (dom == null) return;

  updateInternalVNodes(VNode, "_parentDom", dom, "_renderedBy");
}
