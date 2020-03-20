import { EMPTY_OBJ, EMPTY_ARR, setDomNodeDescriptor } from "./util.js";

/**
 *
 * @param {import("./component").default} c
 * @param {import("./ui").lifeCycleMethod} method
 * @param {boolean} [recurses]
 */
export function runLifeCycle(c, method, ...args) {
  if (!c) return;
  c.__currentLifeCycle = method;
  if (c[method] != null) {
    const fn = function() {
      c[method].apply(c, args);
    };
    if (typeof Promise !== "undefined") {
      return Promise.resolve(fn()).catch(
        e => c.componentDidCatch && c.componentDidCatch(e)
      );
    }
    try {
      fn();
    } catch (e) {
      c.componentDidCatch && c.componentDidCatch(e);
    }
  }
}

/**
 *
 * @param {import("./ui").vNode} node
 */
export function unmountDomTree(node) {
  if (node === EMPTY_OBJ || node == null) return;
  if (node._prevVnode) unmountDomTree(node._prevVnode);
  const dom = node._dom;
  const cc = node._component;
  runLifeCycle(cc, "componentWillUnmount", true);
  if (cc != null) cc.base = cc._vnode = null;
  if (!dom) {
    return;
  }
  if (node._nextDomNode != null)
    setDomNodeDescriptor(node._nextDomNode._vNode, null, "_prevDomNode");
  if (node._prevDomNode != null)
    setDomNodeDescriptor(node._prevDomNode._vNode, null, "_nextDomNode");
  for (const child of node._children || EMPTY_ARR) {
    unmountDomTree(child);
  }
  node._prevVnode = node._component = node._dom = node._prevDomNode = node._nextDomNode = null;

  if (Array.isArray(dom)) {
    let d;
    while ((d = EMPTY_ARR.pop.call(dom || EMPTY_ARR))) {
      removeNode(d);
    }
  } else {
    removeNode(dom);
  }
  dom.onclick = dom._component = dom._listeners = dom._prevVnode = dom._vNode = dom._currentProps = null;
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
