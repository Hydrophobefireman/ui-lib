import {Fragment, RENDER_MODE_CLIENT} from "./constants";
import {createElement} from "./create_element";
import {diff} from "./diff/index";
import {onDiff} from "./lifeCycleCallbacks";
// import { clearDOM } from "./util";
import {VNode, VNodeHost} from "./types/index";
import {clearDOM} from "./util";

export function render(VNode: VNode, parentDom: VNodeHost) {
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
  diff(normalizedVNode, old, parentDom, false, {
    depth: 0,
    isSvg: (parentDom as unknown as SVGElement).ownerSVGElement !== undefined,
    context: {},
    mode: RENDER_MODE_CLIENT,
  });
  // parentDom._hosts = normalizedVNode;
  onDiff();
}

/**@todo fix hydrate */
