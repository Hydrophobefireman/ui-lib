import { diff, flattenVNodeChildren } from "./diff/index.js";
import { Fragment, createElement } from "./create-element.js";
import { commitMounts } from "./lifeCycleRunner.js";

/**
 *
 * @param {import("./ui").vNode} vn
 * @param {import("./ui").UiElement} parentDom
 */
export function render(vn, parentDom) {
  const vnode = createElement(Fragment, null, vn);
  if (parentDom.hasChildNodes()) {
    /**
     * Even though we had render called, we can still diff against the existing dom instead of
     * removing the nodes and creating brand new dom
     */
    return hydrate(parentDom, vnode);
  }
  const mounts = [];
  const oldVnode = null;
  diff(parentDom, vnode, oldVnode, {}, mounts, null, false);
  commitMounts(mounts);
}

/**
 *
 * @param {import("./ui").UiNode} dom
 */
function _getVnodeFromDom(dom) {
  if (dom.nodeName === "#comment") {
    /**should we call .remove on the node?  */ return;
  }
  if (dom instanceof Text) {
    return dom.nodeValue;
  }
  const node = createElement(
    dom.tagName,
    attributesAsProps(dom.attributes),
    Array.from(dom.childNodes).map(_getVnodeFromDom)
  );
  node._children = flattenVNodeChildren(node);
  node._dom = dom;
  dom._vNode = node;
  return node;
}
/**
 *
 * @param {NamedNodeMap} attributes
 */
function attributesAsProps(attributes) {
  const props = {};
  const length = attributes.length;
  for (let i = 0; i < length; i++) {
    const attr = attributes[i];
    const key = attr.name;
    const value = attr.value;
    props[key] = value;
  }
  return props;
}

/**
 *
 * @param {import("./ui").UiElement} dom
 * @param {import("./ui").vNode} vnode
 */
export function hydrate(dom, vnode) {
  const children = Array.from(dom.childNodes);
  const vn = createElement(Fragment, null, children.map(_getVnodeFromDom));
  vn._dom = children;
  vn._children = flattenVNodeChildren(vn);
  const mounts = [];
  diff(dom, vnode, vn, {}, mounts, null, false);
  commitMounts(mounts);
}
