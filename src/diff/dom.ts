import { VNode, UIElement, Props, DiffMeta, DOMOps } from "../types";
import { EMPTY_OBJ, isListener, getClosestDom } from "../util";
import { diffEventListeners } from "./events";
import { PlaceHolder } from "../create_element";
import {
  MODE_SET_STYLE,
  MODE_SET_ATTRIBUTE,
  MODE_REMOVE_ATTRIBUTE,
  MODE_INSERT_BEFORE,
  MODE_APPEND_CHILD,
} from "../commit";
export function diffDomNodes(
  newVNode: VNode,
  oldVNode: VNode,
  parentDom: HTMLElement,
  meta: DiffMeta
) {
  oldVNode = oldVNode || EMPTY_OBJ;

  // oldVNode is being unmounted, append a new DOMNode

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

  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode, meta);

  copyPropsOverEntireTree(newVNode, "_dom", dom);

  setComponent_base(newVNode, dom);

  if (shouldAppend) {
    batchAppendChild(newVNode, parentDom, meta);
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
      return (document.createComment("$") as unknown) as UIElement;
    }

    const dom = document.createElement(type as string) as UIElement;

    // dom.onclick = Fragment;

    return dom;
  }
}

function diffAttributes(
  dom: UIElement,
  newVNode: VNode,
  oldVNode: VNode | null,
  meta: DiffMeta
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
    __removeOldAttributes(dom, prevAttrs, nextAttrs, meta);
  }

  __diffNewAttributes(dom, prevAttrs, nextAttrs, meta);

  diffEventListeners(dom, newVNode.events, oldVNode.events);
}

const UNSAFE_ATTRS = { key: 1, ref: 1, children: 1 };

const attrsToFetchFromDOM = { value: 1, checked: 1 };

function __diffNewAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>,
  meta: DiffMeta
) {
  for (let attr in next) {
    if (isListener(attr) || attr in UNSAFE_ATTRS) continue;

    let newValue = next[attr];

    let oldValue = attrsToFetchFromDOM[attr] ? dom[attr] : prev[attr];

    if (newValue === oldValue) continue;

    attr = attr === "class" ? "className" : attr;

    if (attr === "className") {
      diffClass(dom, newValue, oldValue, meta);

      continue;
    } else if (attr === "style") {
      meta.batch.push({
        node: dom,
        action: MODE_SET_STYLE,
        value: { newValue, oldValue },
      });
      continue;
    }
    meta.batch.push({
      node: dom,
      action: MODE_SET_ATTRIBUTE,
      attr,
      value: newValue,
    });
  }
}

export function diffStyle(
  dom: UIElement,
  newValue: string | object,
  oldValue: string | object
) {
  oldValue = oldValue || "";

  // incase someone sets their style to null
  // fastest way to remove previous props
  newValue = newValue || "";
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
      if (newValue[styleProp] == null) {
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
const trim = (k: string) => k.trim();

function diffClass(
  dom: UIElement,
  newValue: string | string[],
  oldValue: string | string[],
  meta: DiffMeta
) {
  const isArray = Array.isArray;

  if (isArray(newValue)) {
    newValue = trim(newValue.join(" "));
  }

  if (isArray(oldValue)) {
    oldValue = trim(oldValue.join(" "));
  }

  if (newValue === oldValue) return;
  meta.batch.push({
    node: dom,
    action: MODE_SET_ATTRIBUTE,
    attr: "className",
    value: newValue,
  });
}

function __removeOldAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>,
  meta: DiffMeta
) {
  for (const i in prev) {
    if (isListener(i) || i in UNSAFE_ATTRS) continue;

    if (next[i] == null) {
      meta.batch.push({ node: dom, action: MODE_REMOVE_ATTRIBUTE, attr: i });
    }
  }
}

function __diffTextNodes(dom: UIElement, newVal: string, oldVal: string) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}

export function batchAppendChild(
  newVNode: VNode,
  parentDom: HTMLElement,

  meta: DiffMeta
) {
  const domToPlace = newVNode._dom;
  if (!domToPlace) return;

  const nextSibVNode = newVNode._nextSibDomVNode;

  const nextSibDomNode = getClosestDom(nextSibVNode);

  let shouldAppend: boolean = true;

  let insertBefore: HTMLElement;

  if (nextSibDomNode && nextSibDomNode !== domToPlace) {
    shouldAppend = false;

    insertBefore = nextSibDomNode;
  }

  if (!shouldAppend && insertBefore) {
    meta.batch.push({
      node: domToPlace,
      action: MODE_INSERT_BEFORE,
      refDom: insertBefore,
      value: parentDom,
      VNode: newVNode,
    });
  } else {
    meta.batch.push({
      node: domToPlace,
      action: MODE_APPEND_CHILD,
      refDom: parentDom,
      VNode: newVNode,
    });
  }
  // updatePointers(newVNode);
}

export function updatePointers(newVNode: VNode) {
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

const ariaType = /^aria[\-A-Z]/;
/** dom helper */
export function $(dom: HTMLElement, key: string, value: any) {
  const shouldRemove =
    value == null || (value === false && !ariaType.test(key));
  if (key in dom) {
    return (dom[key] = shouldRemove ? "" : value);
  } else {
    if (shouldRemove) return dom.removeAttribute(key);
    return dom.setAttribute(key, value);
  }
}

export function updateParentDomPointers(VNode: VNode, dom: Node) {
  if (dom == null) return;

  updateInternalVNodes(VNode, "_parentDom", dom, "_renderedBy");
}
