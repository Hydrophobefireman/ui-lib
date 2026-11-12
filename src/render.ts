import {Fragment, RENDER_MODE_CLIENT} from "./constants.js";
import {createElement} from "./create_element.js";
import {diff} from "./diff/index.js";
import {onDiff} from "./lifeCycleCallbacks.js";
// import { clearDOM } from "./util.js";
import type {VNode, VNodeHost} from "./types/index.js";
import {clearDOM} from "./util.js";

export function render(VNode: VNode | null, parentDom: VNodeHost) {
  const old = parentDom._hosts;
  const normalizedVNode = createElement(Fragment, null, [VNode]);

  if (!old && parentDom.hasChildNodes()) {
    // hydrate is unstable right now, just clear unmanaged dom on first render
    clearDOM(parentDom);
  }
  diff(normalizedVNode, old, parentDom, false, {
    depth: 0,
    isSvg: (parentDom as unknown as SVGElement).ownerSVGElement !== undefined,
    context: {},
    mode: RENDER_MODE_CLIENT,
  });
  parentDom._hosts = normalizedVNode;
  onDiff();
}

/**@todo fix hydrate */
