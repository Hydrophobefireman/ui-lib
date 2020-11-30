// import { clearDOM } from "./util";
import { DOMOps, UIElement, VNode } from "./types/internal";

import { Fragment } from "./constants";
import { clearDOM } from "./util";
import { createElement } from "./create_element";
import { diff } from "./diff/index";
import { onDiff } from "./lifeCycleCallbacks";

export function render(VNode: VNode, parentDom: UIElement) {
  let old: VNode;
  const normalizedVNode = createElement(
    Fragment,
    old as null /** shorthand for null  */,
    [VNode]
  );

  if (parentDom.hasChildNodes()) {
    // hydrate is unstable right now, just clear the dom and start afresh
    clearDOM(parentDom);
  }
  const batchQueue: DOMOps[] = [];
  diff(normalizedVNode, old, parentDom, false, {
    depth: 0,
    batch: batchQueue,
    isSvg: ((parentDom as unknown) as SVGElement).ownerSVGElement !== undefined,
    context: {},
  });
  // parentDom._hosts = normalizedVNode;
  onDiff(batchQueue);
}

/**@todo fix hydrate */
