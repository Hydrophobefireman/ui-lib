import { diffEventListeners } from "./diff/dom.js";
import { EMPTY_OBJ, EMPTY_ARR, nulliFy } from "./util.js";
import { Fragment } from "./create-element.js";

const _rLifeCycle = (c, m) => {
  c.__currentLifeCycle = m;
  if (c[m] != null) {
    try {
      c[m]();
    } catch (e) {
      if (c.componentDidCatch != null) {
        c.componentDidCatch(e);
      } else {
        throw e;
      }
    }
  }
  c = c._previousComponent;
};
/**
 *
 * @param {import("./component").default} c
 * @param {import("./ui").lifeCycleMethod} method
 * @param {boolean} [recurses]
 */
export function runLifeCycle(c, method, recurses = false) {
  if (!c) return;
  c = _rLifeCycle(c, method);
  while (recurses && c && c._previousComponent) {
    c = _rLifeCycle(c, method);
  }
}

/**
 *
 * @param {import("./ui").vNode} node
 */
export function unmountDomTree(node) {
  if (node === EMPTY_OBJ || node == null) return;
  const dom = node._dom;
  if (!dom) {
    return;
  }
  const cc = node._component || dom ? dom._component : null;
  runLifeCycle(cc, "componentWillUnmount", true);
  // if (dom._listeners != null && dom._listeners !== EMPTY_OBJ) {
  //   diffEventListeners(EMPTY_OBJ, dom._listeners, dom);
  // }
  if (node != null) {
    for (const child of node._children || EMPTY_ARR) {
      unmountDomTree(child);
    }
    nulliFy(node);
  }
  if (cc != null) {
    nulliFy(cc);
  }
  if (node.type === Fragment) {
    let d;
    while ((d = node._children.pop())) {
      removeNode(d);
    }
  } else {
    removeNode(dom);
  }
  dom.onclick = dom._component = dom._listeners = dom._prevVnode = dom._vNode = null;
}

/**
 * @param {Node} node
 */
export function removeNode(node) {
  const p = node.parentNode;
  if (p) {
    p.removeChild(node);
  }
}
export function commitMounts(mounts) {
  let c;
  while ((c = mounts.pop())) {
    runLifeCycle(c, "componentDidMount");
    c._didMount = true;
  }
}
