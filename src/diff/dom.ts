import {
  BATCH_MODE_PLACE_NODE,
  BATCH_MODE_REMOVE_ATTRIBUTE,
  BATCH_MODE_SET_ATTRIBUTE,
  BATCH_MODE_SET_STYLE,
  EMPTY_OBJ,
  NULL_TYPE,
  IS_SVG_ATTR,
  BATCH_MODE_REMOVE_ATTRIBUTE_NS,
  BATCH_MODE_SET_SVG_ATTRIBUTE,
} from "../constants";
import { DiffMeta, Props, UIElement, VNode } from "../types/index";

import { IS_ARIA_PROP } from "../constants";
import { plugins } from "../config";
import { domOp } from "../commit";

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
    dom = createDomFromVNode(newVNode, meta);
  } else {
    dom = oldDom as UIElement;
  }

  dom._VNode = newVNode;
  // copyPropsUpwards(newVNode, "_dom", dom);
  newVNode._dom = dom;
  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode, meta);

  // setComponent_base(newVNode, dom);

  if (shouldAppend) {
    domOp({
      node: dom,
      action: BATCH_MODE_PLACE_NODE,
      refDom: meta.next,
      value: parentDom,
      VNode: newVNode,
    });
  }
}

function createDomFromVNode(newVNode: VNode, meta: DiffMeta): UIElement {
  if (typeof newVNode.props === "string") {
    return (document.createTextNode("") as unknown) as UIElement;
  } else {
    const type = newVNode.type;
    if (type === NULL_TYPE) {
      return (document.createComment("$") as unknown) as UIElement;
    }
    let dom: UIElement;

    if (meta.isSvg) {
      dom = (document.createElementNS(
        "http://www.w3.org/2000/svg",
        type as string
      ) as unknown) as UIElement;
    } else {
      dom = document.createElement(type as string) as UIElement;
    }
    dom._events = {};
    plugins.domNodeCreated(dom, newVNode);
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
      domOp({
        node: dom,
        action: BATCH_MODE_SET_STYLE,
        value: { newValue, oldValue },
      });
      continue;
    }
    domOp({
      node: dom,
      action: meta.isSvg
        ? BATCH_MODE_SET_SVG_ATTRIBUTE
        : BATCH_MODE_SET_ATTRIBUTE,
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
      if (i[0] == "-") {
        st.setProperty(i, prop);
      } else st[i] = prop;
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
  domOp({
    node: dom,
    action: BATCH_MODE_SET_ATTRIBUTE,
    attr: meta.isSvg ? "class" : "className",
    value: newValue,
  });
}

export function __removeOldAttributes(
  dom: UIElement,
  prev: Props<any>,
  next: Props<any>,
  meta: DiffMeta
) {
  for (let i in prev) {
    if (!UNSAFE_ATTRS[i] && next[i] == null && prev[i] != null) {
      const attributeRemovalMode =
        i === (i = i.replace(IS_SVG_ATTR, ""))
          ? BATCH_MODE_REMOVE_ATTRIBUTE
          : BATCH_MODE_REMOVE_ATTRIBUTE_NS;
      domOp({
        node: dom,
        action: attributeRemovalMode,
        attr: i,
      });
    }
  }
}

function __diffTextNodes(dom: UIElement, newVal: string, oldVal: string) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}

/** dom helper */
export function $(dom: UIElement, prop: string, value: any, isSvg?: boolean) {
  if (prop[0] === "o" && prop[1] === "n") {
    return $event(dom, prop as keyof JSX.DOMEvents<any>, value);
  }
  const shouldRemove =
    value == null || (value === false && !IS_ARIA_PROP.test(prop));

  if (!isSvg && prop in dom) {
    return (dom[prop] = shouldRemove ? "" : value);
  } else {
    if (shouldRemove) return dom.removeAttribute(prop);
    return dom.setAttribute(prop, value);
  }
}
function $event(
  dom: UIElement,
  event: string,
  listener: JSX.EventHandler<any>
) {
  event = event.substr(2).toLowerCase();
  const eventDict = dom._events;
  if (listener == null) {
    dom.removeEventListener(event, eventListenerProxy);
    delete eventDict[event];
  } else {
    eventDict[event] || dom.addEventListener(event, eventListenerProxy);
    eventDict[event] = listener;
  }
}

function eventListenerProxy(e: Event) {
  return (this as UIElement)._events[e.type].call(this as EventTarget, e);
}
