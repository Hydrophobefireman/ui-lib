/**
 * @type {(cb) => any}
 * @returns {Promise<any>}
 */
export const defer =
  typeof Promise == "function"
    ? Promise.prototype.then.bind(Promise.resolve())
    : setTimeout;

export const EMPTY_OBJ = {};
export const EMPTY_ARR = [];

const _Obj = EMPTY_OBJ.constructor;
const hasOwnProp = EMPTY_OBJ.hasOwnProperty;
const hasAssign = "assign" in _Obj;

/**
 * from @hydrophobefireman/j-utils
 * @type {ObjectConstructor['assign']}
 */
export const assign = hasAssign
  ? _Obj.assign
  : function(target) {
      for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
          if (hasOwnProp.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

/**
 *
 * @param {Array<Array<T>>} arr
 * @param {number} depth
 * @param {()=>T} map
 * @returns {Array<T>}
 */
export function flattenArray(arr, depth, map, removeHoles = false) {
  const flattend = [];
  const flat = (array, depth) => {
    for (const el of array) {
      if (Array.isArray(el) && depth > 0) {
        flat(el, depth - 1);
      } else {
        if (!removeHoles || el != null) flattend.push(map ? map(el) : el);
      }
    }
  };
  flat(arr, ~~depth || 1);
  return flattend;
}

export const $ = {
  /**
   *
   * @param {import("./ui").UiElement} dom
   * @param {string} key
   * @param {any} value
   */
  setAttribute(dom, key, value) {
    if (key in dom) {
      return (dom[key] = value == null ? "" : value);
    } else {
      if (value == null) return dom.removeAttribute(key);
      return dom.setAttribute(key, value);
    }
  }
};
/**
 * @type {string}
 */
export const isListener = attr => attr[0] === "o" && attr[1] === "n";

/**
 * @type {any}
 * @returns {boolean}
 */
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
  let vn;
  let hasVn;
  let insertBefore;
  if ((hasVn = (vn = child._vNode) != null)) {
    insertBefore = child._vNode._nextDomNode;
  }

  if (child.parentNode !== parentDom || vn._reorder) {
    if (insertBefore != null) {
      parentDom.insertBefore(child, insertBefore);
    } else {
      if (!vn._reorder) parentDom.appendChild(child);
    }
  }
  /**@type {import("./ui").UiNode} */
  const prevDom = child.previousSibling;
  /**@type {import("./ui").UiNode} */
  const nextDom = child.nextSibling;
  if (prevDom == nextDom) return; //will only be equal if they are null
  if (prevDom != null) {
    const prevVnode = prevDom._vNode;
    if (prevVnode != null && prevVnode._nextDomNode !== child) {
      setDomNodeDescriptor(prevVnode, child, "_nextDomNode");
    }
  }

  if (nextDom != null) {
    const nextVnode = nextDom._vNode;
    if (nextVnode != null && nextVnode._nextDomNode !== child)
      setDomNodeDescriptor(nextVnode, child, "_prevDomNode");
  }
  if (hasVn) {
    vn._prevDomNode = prevDom;
    vn._nextDomNode = nextDom;
  }
}

/**
 *
 * @param {import("./ui").vNode} node
 * @param {import("./ui").UiNode} sibDom
 * @param {"_prevDomNode"|"_nextDomNode"} desc
 */
export function setDomNodeDescriptor(node, sibDom, desc) {
  if (node == null) return;
  node[desc] = sibDom;
  const c = node._prevVnode;
  setDomNodeDescriptor(c, sibDom, desc);
}
