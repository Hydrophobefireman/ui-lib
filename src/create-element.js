import { isListener, flattenArray, assign, EMPTY_OBJ } from "./util.js";

export function createElement(type, props, ...children) {
  if (type == null || typeof type === "boolean") return null;
  if (props == null) {
    props = {};
  } else {
    props = assign({}, props);
  }
  if (children.length) {
    children = flattenArray(children, Infinity);
    props.children = children;
  }
  const ref = props.ref;
  if (ref) delete props.ref;
  const key = props.key;
  if (key) delete props.key;
  const events = {};
  for (const i in props) {
    if (isListener(i)) {
      events[i.substr(2).toLowerCase()] = props[i];
      // delete props[i];
    }
  }
  return getVNode(type, props, events, key, ref);
}
export function Fragment() {}

export function getVNode(type, props, events, key, ref) {
  /**
   * @type {import("./ui").vNode}
   */
  const vnode = {
    type,
    props,
    events,
    key,
    ref,
    _children: null,
    _dom: null,
    _component: null,
    __uAttr: null,
    _nextDomNode: null,
    _prevDomNode: null,
    _prevVnode: null
  };
  return (vnode.__uAttr = vnode);
}
/**
 *
 * @param {any} nodeType
 * @returns {import("./ui").vNode}
 */
export function toVnode(nodeType) {
  if (nodeType == null || typeof nodeType === "boolean") {
    return null;
  }
  if (typeof nodeType === "string" || typeof nodeType === "number") {
    return getVNode(null, String(nodeType));
  }
  if (Array.isArray(nodeType)) {
    return createElement(Fragment, null, nodeType);
  }

  // Clone vnode if it has already been used.
  if (nodeType._dom != null) {
    const vnode = getVNode(
      nodeType.type,
      nodeType.props,
      nodeType.events,
      nodeType.key,
      null
    );
    vnode._dom = nodeType._dom;
    return vnode;
  }

  return nodeType;
}
