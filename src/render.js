import { diff } from "./diff/index.js";
import { Fragment, createElement, toVnode } from "./create-element.js";
import { commitMounts } from "./lifeCycleRunner.js";
import { flattenArray, EMPTY_ARR } from "./util.js";

/**
 *
 * @param {import("./ui").vNode} vn
 * @param {import("./ui").UiElement} parentDom
 */
export function render(vn, parentDom) {
  const vnode = createElement(Fragment, null, vn);
  if (parentDom.hasChildNodes()) {
    return hydrate(parentDom, vnode);
  }
  const mounts = [];

  const oldVnode = parentDom._oldVnode;
  parentDom._oldVnode = vn;
  diff(
    parentDom,
    vnode,
    oldVnode,
    {},
    mounts,
    oldVnode == null ? null : oldVnode._component,
    false
  );
  commitMounts(mounts);
}

/**
 *
 * @param {import("./ui").UiNode} dom
 */
function _getVnodeFromDom(dom) {
  if (dom.nodeName === "#comment") return null;
  if (dom instanceof Text) return dom.nodeValue;
  const node = createElement(
    dom.tagName.toLowerCase(),
    null,
    Array.from(dom.childNodes).map(_getVnodeFromDom)
  );
  node._dom = dom;
  dom._vNode = dom._oldVnode = node;
  return node;
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
  vn._children = flattenArray(
    (vn.props && vn.props.children) || EMPTY_ARR,
    Infinity,
    toVnode
  );
  dom._oldVnode = vn;
  const mounts = [];
  diff(dom, vnode, vn, {}, mounts, null, false);
  commitMounts(mounts);
}
