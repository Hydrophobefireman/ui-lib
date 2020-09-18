// import { clearDOM } from "./util";
import { DOMOps, VNode, VNodeHost } from "./types/index";
import { createElement } from "./create_element";

import { clearDOM } from "./util";
import { diff } from "./diff/index";
import { onDiff } from "./lifeCycleCallbacks";
import { Fragment } from "./constants";

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
    isSvg: ((parentDom as unknown) as SVGElement).ownerSVGElement !== undefined,
  });
  // parentDom._hosts = normalizedVNode;
  onDiff(batchQueue);
}

/**@todo fix hydrate */
