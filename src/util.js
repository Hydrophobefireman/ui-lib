/**
 * @type {(cb) => any}
 * @returns {Promise<any>}
 */
export const defer =
  typeof Promise == "function"
    ? Promise.prototype.then.bind(Promise.resolve())
    : setTimeout;

const hasKeys = Object.keys != null;
export let assign;
if (hasKeys) {
  assign = function(target, src) {
    for (const i of Object.keys(src)) {
      target[i] = src[i];
    }
    return target;
  };
} else {
  assign = function(target, src) {
    for (const i in src) {
      target[i] = src[i];
    }
    return target;
  };
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
      if (key in dom) dom[key] = 0;
      else dom.removeAttribute(key);
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
 */
export function appendChild(parentDom, child) {
  if (child == null) return;
  let insertBefore;
  if (child._vNode != null) {
    insertBefore = child._vNode._nextDomNode;
  }
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
export function setDomNodeDescriptor(node, sibDom, desc) {
  if (node == null) return;
  node[desc] = sibDom;
  const c = node._prevVnode;
  setDomNodeDescriptor(c, sibDom, desc);
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
