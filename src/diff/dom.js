import { $, EMPTY_OBJ, isListener } from "../util.js";
import { Fragment } from "../create-element.js";

/**
 *
 * @param {import("../ui").vNode} newVnode
 * @param {import("../ui").vNode} oldVnode
 * @param {import("../ui").UiNode} previousDom
 * @param {boolean} _DisableDiff
 */
export function diffDom(newVnode, oldVnode, previousDom, _DisableDiff) {
  /**
   * @type {import("../ui").UiNode}
   */
  let el;
  const type = newVnode.type;
  // should be called when there is a type mismatch  or we are in a brand new vnode (nothing to diff againts)
  if (_DisableDiff) {
    if (typeof newVnode.props === "string") {
      el = document.createTextNode(newVnode.props);
    } else {
      el = document.createElement(type);
      diffAttributes(el, newVnode, EMPTY_OBJ);
    }
  } else {
    const oldType = oldVnode.type;
    if (type !== oldType) {
      return diffDom(newVnode, null, null, true);
    } else {
      el = previousDom;
      if (previousDom instanceof Text) {
        const newVal = newVnode.props;
        if (previousDom.nodeValue !== newVal) {
          previousDom.nodeValue = newVal;
        }
      } else {
        diffAttributes(el, newVnode, oldVnode);
      }
    }
  }
  if (newVnode._prevVnode != null) {
    newVnode._prevVnode._dom = el;
  }
  return el;
}
const isSafeAttr = attr => attr !== "key" && attr !== "children";
/**
 *
 * @param {import("../ui").UiElement} currentDom
 * @param {import("../ui").vNode} currVnode
 * @param {boolean} hasOldReferenceDom
 * @param {import("../ui").vNode} prevVnode
 */
function diffAttributes(currentDom, currVnode, prevVnode) {
  if (currentDom instanceof Text) return;
  const newAttributes = currVnode.props;
  const prevAttributes = currentDom._currentProps || EMPTY_OBJ;
  currentDom._currentProps = newAttributes;
  const currEvents = currVnode.events;
  const prevEvents = prevVnode != null ? prevVnode.events : EMPTY_OBJ;
  for (const attr in prevAttributes) {
    if (!(attr in newAttributes)) {
      $.setAttribute(currentDom, attr, null);
    }
  }
  for (let attr in newAttributes) {
    if (isListener(attr) || !isSafeAttr(attr)) continue;
    let newValue = newAttributes[attr];
    let oldValue = prevAttributes[attr];
    if (newValue === oldValue) continue;
    attr = attr === "class" ? "className" : attr;
    if (attr === "className") {
      diffClass(currentDom, newValue, oldValue);
      continue;
    } else if (attr === "style") {
      diffStyle(currentDom, newValue, oldValue);
      continue;
    }
    $.setAttribute(currentDom, attr, newValue);
  }
  diffEventListeners(currEvents, prevEvents, currentDom);
}
function diffClass(currentDom, newValue, oldValue) {
  const isArray = Array.isArray;
  if (isArray(newValue)) {
    newValue = newValue.join(" ").trim();
  }
  if (isArray(oldValue)) {
    oldValue = oldValue.join(" ").trim();
  }
  if (newValue === oldValue) return;
  $.setAttribute(currentDom, "className", newValue);
}

function diffStyle(currentDom, newValue, oldValue) {
  oldValue = oldValue || "";
  const st = currentDom.style;
  if (typeof newValue === "string") {
    st.cssText = newValue;
    return;
  }
  const oldValueIsString = typeof oldValue === "string";

  if (oldValueIsString) {
    st.cssText = "";
  } else {
    for (const styleProp in oldValue) {
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

/**
 *
 * @param {Event} e
 * @this {import("../ui").UiElement}
 */
export function eventListenerProxy(e) {
  return this._listeners[e.type].call(this, e);
}

/**
 *
 * @param {import("../ui").vNode['events']} newListeners
 * @param {import("../ui").vNode['events']} oldListeners
 * @param {import("../ui").UiElement} dom
 */
export function diffEventListeners(newListeners, oldListeners, dom) {
  if (newListeners == oldListeners) return;

  if (oldListeners == null) {
    oldListeners = EMPTY_OBJ;
  }
  if (newListeners == null) {
    newListeners = EMPTY_OBJ;
  } else {
    dom.onclick = Fragment;
    dom._listeners = {};
  }
  for (const event in newListeners) {
    const listener = newListeners[event];
    const oldListener = oldListeners[event];
    if (oldListener !== listener && listener != null) {
      dom.addEventListener(event, eventListenerProxy);
      dom._listeners[event] = listener;
    }
  }
  for (const evt in oldListeners) {
    if (newListeners[evt] == null) {
      delete dom._listeners[evt];
      dom.removeEventListener(evt, eventListenerProxy);
    }
  }
}
