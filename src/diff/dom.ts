import {
  VNode,
  UIElement,
  Props,
  DiffMeta,
  RenderedDom,
  WritableProps,
} from "../types/index";
import {
  BATCH_MODE_SET_STYLE,
  BATCH_MODE_SET_ATTRIBUTE,
  BATCH_MODE_REMOVE_ATTRIBUTE,
  BATCH_MODE_INSERT_BEFORE,
  BATCH_MODE_APPEND_CHILD,
  NULL_TYPE,
  EMPTY_OBJ,
} from "../constants";
import { IS_ARIA_PROP } from "../constants";
import { JSXInternal } from "../types/jsx";

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

  let dom: RenderedDom;

  const oldDom = oldVNode._dom;

  if (newType !== oldType || oldDom == null) {
    dom = createDomFromVNode(newVNode);
  } else {
    dom = oldDom as RenderedDom;
  }

  dom._VNode = newVNode;
  copyPropsUpwards(newVNode, "_dom", dom);

  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode, meta);

  setComponent_base(newVNode, dom);

  if (shouldAppend) {
    batchAppendChild(newVNode, parentDom, meta);
  }
}

function copyPropsUpwards(VNode: VNode, prop: WritableProps, value: any) {
  let vn = VNode;
  while (vn) {
    vn[prop] = value;
    vn = vn._renderedBy;
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

    if (type === NULL_TYPE) {
      return (document.createComment("$") as unknown) as UIElement;
    }
    const dom = document.createElement(type as string) as UIElement;
    dom._events = {};
    return dom;
  }
}

function diffAttributes(
  dom: UIElement,
  newVNode: VNode,
  oldVNode: VNode | null,
  meta: DiffMeta
) {
  if (newVNode.type === NULL_TYPE) return;

  oldVNode = oldVNode || EMPTY_OBJ;

  const isTextNode = typeof newVNode.props === "string";
  if (isTextNode) {
    return __diffTextNodes(
      dom,
      (newVNode.props as unknown) as string,
      (oldVNode.props as unknown) as string
    );
  }

  const prevAttrs = oldVNode.props;

  const nextAttrs = newVNode.props;

  if (prevAttrs != null) {
    __removeOldAttributes(dom, prevAttrs, nextAttrs, meta);
  }

  __diffNewAttributes(dom, prevAttrs || EMPTY_OBJ, nextAttrs, meta);
}

const domSourceOfTruth = { value: 1, checked: 1 };
const UNSAFE_ATTRS = { key: 1, ref: 1, children: 1 };

function __diffNewAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>,
  meta: DiffMeta
) {
  for (let attr in next) {
    if (attr in UNSAFE_ATTRS) continue;

    let newValue = next[attr];
    let oldValue = domSourceOfTruth[attr] ? dom[attr] : prev[attr];

    if (newValue === oldValue) continue;

    attr = attr === "class" ? "className" : attr;

    if (attr === "className") {
      diffClass(dom, newValue, oldValue, meta);
      continue;
    } else if (attr === "style") {
      meta.batch.push({
        node: dom,
        action: BATCH_MODE_SET_STYLE,
        value: { newValue, oldValue },
      });
      continue;
    }
    meta.batch.push({
      node: dom,
      action: BATCH_MODE_SET_ATTRIBUTE,
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
    action: BATCH_MODE_SET_ATTRIBUTE,
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
    if (next[i] == null && prev[i] != null) {
      meta.batch.push({
        node: dom,
        action: BATCH_MODE_REMOVE_ATTRIBUTE,
        attr: i,
      });
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
  const domToPlace = newVNode._dom as RenderedDom;
  if (!domToPlace) return;

  const nextSibDomNode = meta.next;

  let appendChild: boolean = true;

  let insertBefore: HTMLElement;

  if (nextSibDomNode && nextSibDomNode !== domToPlace) {
    appendChild = false;
    insertBefore = nextSibDomNode;
  }

  if (!appendChild && insertBefore) {
    meta.batch.push({
      node: domToPlace,
      action: BATCH_MODE_INSERT_BEFORE,
      refDom: insertBefore,
      value: parentDom,
      VNode: newVNode,
    });
  } else {
    meta.batch.push({
      node: domToPlace,
      action: BATCH_MODE_APPEND_CHILD,
      refDom: parentDom,
      VNode: newVNode,
    });
  }
  // updatePointers(newVNode);
}

// export function copyPropsOverEntireTree(
//   VNode: VNode,
//   propVal: WritableProps,
//   val: any
// ) {
//   updateInternalVNodes(VNode, propVal, val, "_renders");

//   updateInternalVNodes(VNode, propVal, val, "_renderedBy");
// }

// export function updateInternalVNodes(
//   VNode: VNode,
//   prop: WritableProps,
//   val: any,
//   nextGetter: "_renders" | "_renderedBy"
// ) {
//   let next = VNode;
//   while (next != null) {
//     next[prop] = val;
//     next = next[nextGetter];
//   }
// }

/** dom helper */
export function $(dom: UIElement, prop: string, value: any) {
  if (prop[0] === "o" && prop[1] === "n") {
    return $event(dom, prop as keyof JSXInternal.DOMEvents<any>, value);
  }
  const shouldRemove =
    value == null || (value === false && !IS_ARIA_PROP.test(prop));

  if (prop in dom) {
    return (dom[prop] = shouldRemove ? "" : value);
  } else {
    if (shouldRemove) return dom.removeAttribute(prop);
    return dom.setAttribute(prop, value);
  }
}
function $event(
  dom: UIElement,
  event: string,
  listener: JSXInternal.EventHandler<any>
) {
  event = event.substr(2).toLowerCase();
  if (listener == null) {
    dom.removeEventListener(event, eventListenerProxy);
    delete dom._events[event];
  }
  dom.addEventListener(event, eventListenerProxy);
  dom._events[event] = listener;
}

function eventListenerProxy(e: Event) {
  return (this as UIElement)._events[e.type].call(this as EventTarget, e);
}
