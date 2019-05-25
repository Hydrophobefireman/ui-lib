/**
 * @type {(cb) => any}
 * @returns {Promise<any>}
 */
export const defer =
  typeof Promise == "function"
    ? Promise.prototype.then.bind(Promise.resolve())
    : setTimeout;

export function assign(obj, props) {
  for (const i in props) {
    obj[i] = props[i];
  }
  return obj;
}

/**
 *
 * @param {Array<Array<T>>} arr
 * @param {number} depth
 * @param {()=>T} map
 * @returns {Array<T>}
 */
export function flattenArray(arr, depth, map, removeHoles = true) {
  if (Array.prototype.flat) {
    if (map == null) {
      const flt = arr.flat(depth);
      if (removeHoles) {
        return flt.filter(x => x != null && typeof x !== "boolean");
      }
      return flt;
    } else {
      if (Array.prototype.flatMap) {
        return arr.flatMap(map);
      } else {
        return arr.flat(depth).map(map);
      }
    }
  } else {
    const ret = [];
    const itr = (el, level = 0) => {
      if (Array.isArray(el) && level < depth) {
        return el.forEach(c => itr(c, level + 1));
      }
      if (removeHoles && el != null) ret.push(el);
    };
    for (const i of arr) {
      itr(i);
    }
    const flt = map != null ? ret.map(map) : ret;
    return flt;
  }
}
export const EMPTY_OBJ = {};
export const EMPTY_ARR = [];

export const $ = {
  /**
   *
   * @param {import("./ui").UiElement} dom
   * @param {string} key
   * @param {any} value
   */
  setAttribute(dom, key, value) {
    if (value == null) {
      if (dom.hasAttribute(key)) {
        dom.removeAttribute(key);
      }
      if (key in dom) {
        dom[key] = null;
      }
      return;
    }
    if (key in dom) {
      if (dom[key] !== value) {
        return (dom[key] = value);
      }
    } else {
      if (dom.getAttribute(key) !== value) {
        if (!value && value !== false) {
          dom.removeAttribute(key);
        } else {
          return dom.setAttribute(key, value);
        }
      }
    }
  }
};

export const isListener = attr => attr[0] === "o" && attr[1] === "n";

export function isStringLike(a) {
  return typeof a === "string" || typeof a === "number";
}

/**
 *
 * @param {import("./ui").UiElement} parentDom
 * @param {import("./ui").UiNode} child
 * @param {import("./ui").UiNode} insertBefore
 */
export function appendChild(parentDom, child, insertBefore) {
  if (child != null && child.parentNode !== parentDom && child !== parentDom) {
    if (insertBefore != null) {
      parentDom.insertBefore(child, insertBefore);
    } else {
      parentDom.appendChild(child);
    }
  }
  /**@type {import("./ui").UiNode} */
  const prevDom = child.previousSibling;
  let prevVnode;
  if (prevDom != null && (prevVnode = prevDom._vNode) != null) {
    setDomNodeDescriptor(prevVnode, child, "_nextDomNode");
  }
  const nextDom = child.nextSibling;
  let nextVnode;
  if (nextDom != null && (nextVnode = nextDom._vNode) != null) {
    setDomNodeDescriptor(nextVnode, child, "_prevDomNode");
  }
  let vn = child._vNode;
  if (vn != null) {
    vn._prevDomNode = prevDom;
  }
}

/**
 *
 * @param {import("./ui").vNode} node
 */
function setDomNodeDescriptor(node, sibDom, desc) {
  node[desc] = sibDom;
  const c = node._prevVnode;
  if (c != null) c[desc] = sibDom;
}
// /**
//  *
//  * @param {object} obj
//  */
// export function nulliFy(obj) {
//   for (const i in obj) {
//     obj[i] = null;
//   }
// }
