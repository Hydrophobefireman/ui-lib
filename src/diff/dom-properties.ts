import {IS_ARIA_PROP} from "../constants.js";
import type {UIElement} from "../types/index.js";

export function diffStyle(
  dom: UIElement,
  newValue: string | object,
  oldValue: string | object
) {
  // Null styles clear the previous declaration set.
  oldValue = oldValue || "";
  newValue = newValue || "";
  const style = dom.style;

  if (typeof newValue === "string") {
    style.cssText = newValue;
    return;
  }

  const oldValueIsString = typeof oldValue === "string";
  if (oldValueIsString) {
    style.cssText = "";
  } else {
    for (const property in oldValue as object) {
      if (newValue[property] == null) {
        if (property[0] === "-") style.removeProperty(property);
        else style[property] = "";
      }
    }
  }

  for (const property in newValue) {
    const value = newValue[property];
    if (oldValueIsString || value !== oldValue[property]) {
      if (property[0] === "-") style.setProperty(property, value);
      else style[property] = value;
    }
  }
}

export function setDOMProperty(
  dom: UIElement,
  property: string,
  value: any,
  isSvg: boolean,
  isSSR: boolean
) {
  if (property[0] === "o" && property[1] === "n") {
    return setEventHandler(dom, property, value);
  }

  const shouldRemove =
    value == null || (value === false && !IS_ARIA_PROP.test(property));
  if (!isSvg && !isSSR && property in dom) {
    return (dom[property] = shouldRemove ? "" : value);
  }
  if (shouldRemove) return dom.removeAttribute(property);
  return dom.setAttribute(property, value);
}

function parseEventProperty(
  dom: UIElement,
  property: string
): [event: string, capture: boolean] {
  let name = property.slice(2);
  let capture = false;
  const suffix = "Capture";
  if (name.length > suffix.length && name.endsWith(suffix)) {
    const base = name.slice(0, -suffix.length);
    // Pointer Events such as gotpointercapture also end in "Capture".
    if ("on" + base.toLowerCase() in dom) {
      capture = true;
      name = base;
    }
  }
  return [name.toLowerCase(), capture];
}

function setEventHandler(dom: UIElement, property: string, listener: any) {
  const [event, capture] = parseEventProperty(dom, property);
  const eventDict = dom._events || (dom._events = {});
  const record = eventDict[event] || (eventDict[event] = {});
  const phase = capture ? "capture" : "bubble";
  const proxyKey = capture ? "captureProxy" : "bubbleProxy";

  if (listener == null) {
    const proxy = record[proxyKey];
    if (proxy) {
      dom.removeEventListener(event, proxy, capture);
      record[proxyKey] = undefined;
    }
    record[phase] = undefined;
    if (!record.bubble && !record.capture) delete eventDict[event];
    return;
  }

  record[phase] = listener;
  if (!record[proxyKey]) {
    const proxy: EventListener = (e) => {
      const current = eventDict[event];
      const handler = current && current[phase];
      if (handler) handler.call(dom, e);
    };
    record[proxyKey] = proxy;
    dom.addEventListener(event, proxy, capture);
  }
}
