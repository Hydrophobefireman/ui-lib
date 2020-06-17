import { createElement, Fragment } from "./create_element";
import { VNode, VNodeHost, DOMOps } from "./types";

import { diff } from "./diff/index";
import { onDiff } from "./lifeCycleCallbacks";
import { clearDOM } from "./util";

export function render(VNode: VNode, parentDom: VNodeHost) {
  const normalizedVNode = createElement(Fragment, null, [VNode]);

  if (parentDom.hasChildNodes()) {
    // hydrate is unstable right now, just clear the dom and start afresh
    /*#__NOINLINE__*/
    clearDOM(parentDom);
  }
  const batchQueue: DOMOps[] = [];
  diff(normalizedVNode, null, parentDom, false, {
    depth: 0,
    batch: batchQueue,
  });
  // parentDom._hosts =  normalizedVNode;
  onDiff(batchQueue);
}

/**@todo fix hydrate */
