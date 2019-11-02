import { diff } from "./diff/index.js";
import { Fragment, createElement } from "./create-element.js";
import { commitMounts } from "./lifeCycleRunner.js";
/**
 *
 * @param {import("./ui").vNode} vn
 * @param {import("./ui").UiElement} parentDom
 */
export function render(vn, parentDom) {
  const vnode = createElement(Fragment, null, vn);
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
    false,
    null
  );
  commitMounts(mounts);
}
