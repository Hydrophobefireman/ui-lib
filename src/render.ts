import { createElement, Fragment } from "./create_element";

import { diff } from "./diff/index";
import { onDiff } from "./lifeCycleCallbacks";
// import { clearDOM } from "./util";
import { VNode, DOMOps, VNodeHost } from "./types/index";
import { clearDOM } from "./util";

export function render(VNode: VNode, parentDom: VNodeHost) {
  let old: VNode;
  const normalizedVNode = createElement(
    Fragment,
    old as null /** shorthand for null  */,
    [VNode]
  );

  if (parentDom.hasChildNodes()) {
    // hydrate is unstable right now, just clear the dom and start afresh
    clearDOM(parentDom) as null;
  }
  const batchQueue: DOMOps[] = [];
  diff(normalizedVNode, old, parentDom, false, {
    depth: 0,
    batch: batchQueue,
  });
  // parentDom._hosts = normalizedVNode;
  onDiff(batchQueue);
}

/**@todo fix hydrate */
