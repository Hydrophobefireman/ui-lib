import { UIElement, EventListenerDict } from "../types";
import { Fragment } from "../create_element";
import { EMPTY_OBJ } from "../util";

export function diffEventListeners(
  dom: UIElement,
  newEvents: EventListenerDict,
  oldEvents: EventListenerDict
) {
  if (dom == null || dom instanceof Text || newEvents === oldEvents) return;
  if (dom._listeners == null) dom._listeners = {};
  if (newEvents != null) {
    if (dom._listeners == null) {
      dom.onclick = Fragment;
    }
  } else {
    newEvents = EMPTY_OBJ;
  }
  if (oldEvents == null) {
    oldEvents = EMPTY_OBJ;
  }
  for (const event in oldEvents) {
    if (!(event in newEvents)) {
      delete dom._listeners[event];
      dom.removeEventListener(event, eventListenerProxy);
    }
  }
  for (const event in newEvents) {
    const listener = newEvents[event];
    const oldListener = oldEvents[event];
    if (oldListener !== listener) {
      if (oldListener == null) dom.addEventListener(event, eventListenerProxy);
      dom._listeners[event] = listener;
    }
  }
}

export function eventListenerProxy(e: Event) {
  return (this as UIElement)._listeners[e.type].call(this as EventTarget, e);
}
