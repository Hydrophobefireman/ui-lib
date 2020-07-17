const EMPTY_OBJ = {};
const EMPTY_ARRAY = [];
const IS_ARIA_PROP = /^aria[\-A-Z]/;
const IS_SVG_ATTR = /^xlink:?/;
const BATCH_MODE_SET_ATTRIBUTE = 1;
const BATCH_MODE_REMOVE_ATTRIBUTE = BATCH_MODE_SET_ATTRIBUTE;
const BATCH_MODE_REMOVE_ELEMENT = 2;
const BATCH_MODE_SET_STYLE = 3;
const BATCH_MODE_PLACE_NODE = 4;
const BATCH_MODE_SET_SVG_ATTRIBUTE = 5;
const BATCH_MODE_REMOVE_ATTRIBUTE_NS = 6;
const BATCH_MODE_CLEAR_POINTERS = 7;
/**
 * Special constant to mark `null` elements
 * @example
 * function App() {
 *  return <div>{someCondition && <div>It is True!</div> }</div>
 * }
 * @description
 * in case `someCondition` is falsey, we will render a comment (`<!--$-->`) in the dom instead
 * this makes it easier for us to detect changes and additions/removals in case of <Fragment>
 * supporting which is the reason this "workaround" exists
 */

const NULL_TYPE = {};
const LIFECYCLE_WILL_MOUNT = "componentWillMount";
const LIFECYCLE_DID_MOUNT = "componentDidMount";
const LIFECYCLE_WILL_UPDATE = "componentWillUpdate";
const LIFECYCLE_DID_UPDATE = "componentDidUpdate";
const LIFECYCLE_WILL_UNMOUNT = "componentWillUnmount";

function flat(arr, flattenedArray, map) {
  if (!arr) return flattenedArray;

  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];

    if (Array.isArray(el)) {
      flat(el, flattenedArray, map);
    } else {
      flattenedArray.push(map ? map(el) : el);
    }
  }

  return flattenedArray;
}
/** flattens array (to `Infinity`) */


function flattenArray(array, map) {
  const flattened = [];
  return flat(array, flattened, map);
}
const hasOwnProp = EMPTY_OBJ.hasOwnProperty;
const $Object = EMPTY_OBJ.constructor;
const assign = $Object.assign || function Object_assign(target) {
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
function clearDOM(dom) {
  let c;

  while (c = dom.firstChild) {
    dom.removeChild(c);
  }
}
function isValidVNode(V, undef) {
  if (!V || V.constructor !== undef) {
    console.warn("component not of expected type =>", V);
    return false;
  }

  return true;
}
const objectWithoutKeys = (obj, keys) => {
  let ret = {};
  let key;

  for (key in obj) {
    if (keys.indexOf(key) === -1) {
      ret[key] = obj[key];
    }
  }

  return ret;
};

const Fragment = function Fragment() {};
const skipProps = ["key", "ref"];
function createElement(type, props) {
  if (type == null || typeof type == "boolean") return null;

  if (props == null) {
    props = EMPTY_OBJ;
  }

  let children; // don't pass ref & key to the component

  const ref = props.ref;
  const key = props.key; // TODO remove any

  props = objectWithoutKeys(props, skipProps); // children provided as the extra args are used
  // mark props.children as empty_arr so we know the no child was passed

  let _children;

  if (props.children != null) {
    _children = flattenArray([props.children]);
  } else if ((children = EMPTY_ARRAY.slice.call(arguments, 2)).length) {
    _children = flattenArray(children);
  }

  props.children = _children;
  return getVNode(type, props, key, ref);
}
function coerceToVNode(VNode) {
  // don't render anything to the dom, just leave a comment
  if (VNode == null || typeof VNode === "boolean") {
    return createElement(NULL_TYPE);
  }

  if (typeof VNode === "string" || typeof VNode === "number") {
    return getVNode(null, String(VNode));
  } // a function returned an array instead of a fragment, normalize it


  if (Array.isArray(VNode)) {
    return createElement(Fragment, null, VNode);
  } // VNode exists, clone


  if (VNode._dom != null) {
    const vn = getVNode(VNode.type, VNode.props, VNode.key);
    return vn;
  }

  return VNode;
}
/** return a flat array of children and normalize them */

function flattenVNodeChildren(VNode) {
  let c = VNode.props.children; // even if we are creating an empty fragment
  // we will still render a null child (`c`)
  // as it will serve as a memory for where the fragment's
  // future children should be

  const nullChildren = c == null;

  if (VNode.type !== Fragment) {
    if (nullChildren) return [];
  } else {
    if (c && !c.length) c = null;
  }

  return flattenArray([c], coerceToVNode);
}

function getVNode(type, props, key, ref) {
  return {
    type,
    props,
    key,
    ref,
    _dom: null,
    _children: null,
    _component: null,
    _renders: null,
    _renderedBy: null,
    _parentDom: null,
    _depth: 0,
    constructor: undefined
  };
}

const HAS_PROMISE = typeof Promise !== "undefined";
const defer = HAS_PROMISE ? Promise.prototype.then.bind(Promise.resolve()) : f => setTimeout(f);
const HAS_RAF = typeof requestAnimationFrame === "function";
const plugins = {
  hookSetup: Fragment,
  diffed: Fragment
};
function addPluginCallback(type, cb) {
  let oldType = plugins[type];
  if (oldType === Fragment) oldType = null;

  plugins[type] = function () {
    oldType && oldType.apply(0, arguments);
    cb.apply(0, arguments);
  };
}
const config = {
  scheduleRender: HAS_RAF ? cb => requestAnimationFrame(cb) : defer,
  eagerlyHydrate: true,
  RAF_TIMEOUT: 100,
  debounceEffect: null
};

function diffDomNodes(newVNode, oldVNode, parentDom, meta) {
  oldVNode = oldVNode || EMPTY_OBJ; // oldVNode is being unmounted, append a new DOMNode

  const shouldAppend = oldVNode === EMPTY_OBJ;
  const newType = newVNode.type;
  const oldType = oldVNode.type;
  let dom;
  const oldDom = oldVNode._dom;

  if (newType !== oldType || oldDom == null) {
    dom = createDomFromVNode(newVNode, meta);
  } else {
    dom = oldDom;
  }

  dom._VNode = newVNode; // copyPropsUpwards(newVNode, "_dom", dom);

  newVNode._dom = dom;
  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode, meta); // setComponent_base(newVNode, dom);

  if (shouldAppend) {
    meta.batch.push({
      node: dom,
      action: BATCH_MODE_PLACE_NODE,
      refDom: meta.next,
      value: parentDom,
      VNode: newVNode
    });
  }
} // function setComponent_base(VNode: VNode, dom: UIElement) {
//   if (!VNode) return;
//   if (VNode._component != null) {
//     /** set the base value of the first component we find while travelling up the tree */
//     VNode._component.base = dom;
//   } else {
//     setComponent_base(VNode._renderedBy, dom);
//   }
// }

function createDomFromVNode(newVNode, meta) {
  if (typeof newVNode.props === "string") {
    return document.createTextNode("");
  } else {
    const type = newVNode.type;

    if (type === NULL_TYPE) {
      return document.createComment("$");
    }

    let dom;

    if (meta.isSvg) {
      dom = document.createElementNS("http://www.w3.org/2000/svg", type);
    } else {
      dom = document.createElement(type);
    }

    dom._events = {};
    return dom;
  }
}

function diffAttributes(dom, newVNode, oldVNode, meta) {
  if (newVNode.type === NULL_TYPE) return;
  oldVNode = oldVNode || EMPTY_OBJ;
  const isTextNode = typeof newVNode.props === "string";

  if (isTextNode) {
    return __diffTextNodes(dom, newVNode.props, oldVNode.props);
  }

  const prevAttrs = oldVNode.props;
  const nextAttrs = newVNode.props;

  if (prevAttrs != null) {
    __removeOldAttributes(dom, prevAttrs, nextAttrs, meta);
  }

  __diffNewAttributes(dom, prevAttrs || EMPTY_OBJ, nextAttrs, meta);
}

const domSourceOfTruth = {
  value: 1,
  checked: 1
};
const UNSAFE_ATTRS = {
  key: 1,
  ref: 1,
  children: 1
};

function __diffNewAttributes(dom, prev, next, meta) {
  for (let attr in next) {
    if (attr in UNSAFE_ATTRS) continue;
    let newValue = next[attr];
    let oldValue = domSourceOfTruth[attr] ? dom[attr] : prev[attr];
    if (newValue === oldValue) continue;
    attr = attr === "class" ? "className" : attr;

    if (attr === "className") {
      diffClass(dom, newValue, oldValue, meta);
      continue;
    } else if (attr === "style") {
      meta.batch.push({
        node: dom,
        action: BATCH_MODE_SET_STYLE,
        value: {
          newValue,
          oldValue
        }
      });
      continue;
    }

    meta.batch.push({
      node: dom,
      action: meta.isSvg ? BATCH_MODE_SET_SVG_ATTRIBUTE : BATCH_MODE_SET_ATTRIBUTE,
      attr,
      value: newValue
    });
  }
}

function diffStyle(dom, newValue, oldValue) {
  oldValue = oldValue || ""; // incase someone sets their style to null
  // fastest way to remove previous props

  newValue = newValue || "";
  const st = dom.style;

  if (typeof newValue === "string") {
    st.cssText = newValue;
    return;
  }

  const oldValueIsString = typeof oldValue === "string";

  if (oldValueIsString) {
    st.cssText = "";
  } else {
    for (const styleProp in oldValue) {
      if (newValue[styleProp] == null) {
        st[styleProp] = "";
      }
    }
  }

  for (const i in newValue) {
    const prop = newValue[i];

    if (oldValueIsString || prop !== oldValue[i]) {
      st[i] = prop;
    }
  }
}

const trim = k => k.trim();

function diffClass(dom, newValue, oldValue, meta) {
  const isArray = Array.isArray;

  if (isArray(newValue)) {
    newValue = trim(newValue.join(" "));
  }

  if (isArray(oldValue)) {
    oldValue = trim(oldValue.join(" "));
  }

  if (newValue === oldValue) return;
  meta.batch.push({
    node: dom,
    action: BATCH_MODE_SET_ATTRIBUTE,
    attr: meta.isSvg ? "class" : "className",
    value: newValue
  });
}

function __removeOldAttributes(dom, prev, next, meta) {
  for (let i in prev) {
    if (!UNSAFE_ATTRS[i] && next[i] == null && prev[i] != null) {
      const attributeRemovalMode = i === (i = i.replace(IS_SVG_ATTR, "")) ? BATCH_MODE_REMOVE_ATTRIBUTE : BATCH_MODE_REMOVE_ATTRIBUTE_NS;
      meta.batch.push({
        node: dom,
        action: attributeRemovalMode,
        attr: i
      });
    }
  }
}

function __diffTextNodes(dom, newVal, oldVal) {
  return newVal === oldVal || (dom.nodeValue = newVal);
} // export function copyPropsOverEntireTree(
//   VNode: VNode,
//   propVal: WritableProps,
//   val: any
// ) {
//   updateInternalVNodes(VNode, propVal, val, "_renders");
//   updateInternalVNodes(VNode, propVal, val, "_renderedBy");
// }
// export function updateInternalVNodes(
//   VNode: VNode,
//   prop: WritableProps,
//   val: any,
//   nextGetter: "_renders" | "_renderedBy"
// ) {
//   let next = VNode;
//   while (next != null) {
//     next[prop] = val;
//     next = next[nextGetter];
//   }
// }

/** dom helper */


function $(dom, prop, value, isSvg) {
  if (prop[0] === "o" && prop[1] === "n") {
    return $event(dom, prop, value);
  }

  const shouldRemove = value == null || value === false && !IS_ARIA_PROP.test(prop);

  if (!isSvg && prop in dom) {
    return dom[prop] = shouldRemove ? "" : value;
  } else {
    if (shouldRemove) return dom.removeAttribute(prop);
    return dom.setAttribute(prop, value);
  }
}

function $event(dom, event, listener) {
  event = event.substr(2).toLowerCase();

  if (listener == null) {
    dom.removeEventListener(event, eventListenerProxy);
    delete dom._events[event];
  } else {
    dom.addEventListener(event, eventListenerProxy);
    dom._events[event] = listener;
  }
}

function eventListenerProxy(e) {
  return this._events[e.type].call(this, e);
}

function commitDOMOps(queue) {
  const queueLen = queue.length;

  for (let i = 0; i < queueLen; i++) {
    const op = queue[i];
    const dom = op.node;
    const action = op.action;
    const refDom = op.refDom;
    const value = op.value;
    const VNode = op.VNode;
    let attr = op.attr;

    switch (action) {
      case BATCH_MODE_PLACE_NODE:
        value.insertBefore(dom, refDom);
        break;

      case BATCH_MODE_SET_ATTRIBUTE:
        // in case of removeAttribute, `op.attr===undefined`
        $(dom, attr, value);
        break;

      case BATCH_MODE_SET_STYLE:
        diffStyle(dom, value.newValue, value.oldValue);
        break;

      case BATCH_MODE_REMOVE_ELEMENT:
        removeNode(dom);
        removePointers(VNode, dom);
        break;

      case BATCH_MODE_CLEAR_POINTERS:
        removePointers(VNode, dom);
        break;

      case BATCH_MODE_REMOVE_ATTRIBUTE_NS:
        dom.removeAttributeNS("http://www.w3.org/1999/xlink", attr);
        break;

      case BATCH_MODE_SET_SVG_ATTRIBUTE:
        const isSVGSpecificAttr = attr !== (attr = attr.replace(IS_SVG_ATTR, ""));
        isSVGSpecificAttr ? dom.setAttributeNS("http://www.w3.org/1999/xlink", attr.toLowerCase(), value) : $(dom, attr, value, true);
        break;
    }
  } // queue is immutable, we build a new one everytime
  //   queue.length = 0;

}

function removeNode(dom) {
  if (dom == null) return;
  const p = dom.parentNode;

  if (p) {
    p.removeChild(dom);
  }
}

function removePointers(VNode, dom) {
  clearDomNodePointers(dom);
  clearVNodePointers(VNode);
}

const DOM_POINTERS = {
  _VNode: 1,
  _events: 1
};
const VNode_POINTERS = {
  _children: 1,
  _component: 1,
  _depth: 1,
  _dom: 1,
  _renderedBy: 1,
  _renders: 1,
  _parentDom: 1,
  key: 1,
  ref: 1
};

function clearDomNodePointers(dom) {
  _clearPointers(DOM_POINTERS, dom);
}

function clearVNodePointers(VNode) {
  if (VNode == null) return;

  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj, el) {
  if (el == null) return;

  for (const i in pointersObj) {
    el[i] = null;
  }
}

const mountCallbackQueue = [];
const updateCallbackQueue = [];

function processLifeCycleQueue(obj) {
  let cbObj;

  while (cbObj = obj.pop()) {
    __executeCallback(cbObj);
  }
}

function scheduleLifeCycleCallbacks(options) {
  const name = options.name;
  if (name === LIFECYCLE_DID_MOUNT) return mountCallbackQueue.push(options);else if (name === LIFECYCLE_DID_UPDATE) return updateCallbackQueue.push(options);else __executeCallback(options);
}

function __executeCallback(cbObj) {
  const fName = cbObj.name;
  const component = cbObj.bind;
  const func = component[fName];
  component._lastLifeCycleMethod = fName;
  if (!func) return;
  const args = cbObj.args;
  const hasCatch = typeof component.componentDidCatch == "function";

  const cb = () => func.apply(component, args);

  if (HAS_PROMISE) {
    defer(cb).catch(error => {
      if (hasCatch) {
        component.componentDidCatch(error);
      } else {
        throw error;
      }
    });
  } else {
    try {
      cb();
    } catch (e) {
      if (hasCatch) return component.componentDidCatch(e);
      throw e;
    }
  }
}

function onDiff(queue) {
  commitDOMOps(queue);
  plugins.diffed();
  processLifeCycleQueue(mountCallbackQueue);
  processLifeCycleQueue(updateCallbackQueue);
}

const RENDER_QUEUE = [];
/** The pseudo-abstract component class */

class Component {
  constructor(props) {
    this.state = {};
    this.props = props;
  }

  render(props, state) {
    return null;
  }

  setState(nextState) {
    //clone states
    this._oldState = assign({}, this.state);
    this._nextState = assign({}, this._nextState || this.state);

    if (typeof nextState === "function") {
      const next = nextState(this._nextState, this.props);
      if (next == null) return;
      assign(this._nextState, next);
    } else {
      assign(this._nextState, nextState);
    }

    enqueueRender(this);
  }

  forceUpdate(callback) {
    if (this._VNode == null) return;
    const batchQueue = [];
    const shouldForce = callback !== false;
    diff(this._VNode, assign({}, this._VNode), this._VNode._parentDom, shouldForce, {
      depth: this._depth,
      batch: batchQueue,
      isSvg: false
    });
    typeof callback === "function" && callback();
    onDiff(batchQueue);
  }

}

function enqueueRender(c) {
  c._dirty = true;

  if (RENDER_QUEUE.push(c) === 1) {
    config.scheduleRender(process);
  }
}

function process() {
  let p;
  RENDER_QUEUE.sort((x, y) => x._depth - y._depth);

  while (p = RENDER_QUEUE.pop()) {
    if (p._dirty) {
      p._dirty = false;
      p.forceUpdate(false);
    }
  }
}

function setRef(ref, value) {
  if (!ref) return;
  if (typeof ref == "function") ref(value);else ref.current = value;
}
function diffReferences(newVNode, oldVNode, domOrComponent) {
  const newRef = newVNode.ref;
  const oldRef = (oldVNode || EMPTY_OBJ).ref;

  if (newRef && newRef !== oldRef) {
    setRef(newRef, domOrComponent);
    oldRef && setRef(oldVNode.ref, null);
  }
}
function createRef() {
  return {
    current: null
  };
}

const isFn = vnType => typeof vnType === "function" && vnType !== Fragment;
function toSimpleVNode(VNode, oldVNode, forceUpdate, meta) {
  let type;

  if (VNode != null && isFn(type = VNode.type)) {
    oldVNode = oldVNode || EMPTY_OBJ;
    let next;

    if (isClassComponent(type)) {
      /** class component, call lifecycle methods */
      next = renderClassComponent(VNode, oldVNode, forceUpdate, meta);
    } else {
      /** run hooks */
      next = renderFunctionalComponent(VNode, meta);
    }

    VNode._renders = next;
    next._renderedBy = VNode;
    return next;
  } else {
    /** VNode is already simple */
    return VNode;
  }
}

function renderClassComponent(VNode, oldVNode, forceUpdate, meta) {
  let nextLifeCycle;
  const cls = VNode.type;
  let component = VNode._component;
  const isExisting = component != null;

  if (isExisting) {
    nextLifeCycle = LIFECYCLE_DID_UPDATE;
    /**existing component */

    if (component.shouldComponentUpdate != null && !forceUpdate) {
      const scu = component.shouldComponentUpdate(VNode.props, component._nextState || component.state);

      if (scu === false) {
        return EMPTY_OBJ;
      }
    }
  } else {
    nextLifeCycle = LIFECYCLE_DID_MOUNT;
    component = new cls(VNode.props);
    VNode._component = component;
    component._depth = ++meta.depth;
  }

  component._VNode = VNode;
  const oldState = component._oldState;
  const oldProps = oldVNode.props;
  scheduleLifeCycleCallbacks({
    bind: component,
    name: isExisting ? LIFECYCLE_WILL_UPDATE : LIFECYCLE_WILL_MOUNT,
    args: isExisting ? [VNode.props, component._nextState] : null
  });
  component.state = applyCurrentState(component, cls, VNode);
  component._oldState = null;
  component._nextState = null;
  component.props = VNode.props;
  const nextVNode = coerceToVNode(component.render(component.props, component.state));
  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === LIFECYCLE_DID_UPDATE ? [oldProps, oldState] : []
  });
  diffReferences(VNode, oldVNode, component);
  return nextVNode;
}

function renderFunctionalComponent(VNode, meta) {
  let nextVNode;
  const fn = VNode.type;
  let c;

  if (!VNode._component) {
    /** New Functional component, convert it into a fake component
     * to save its instance
     * (doesnt help now but will be useful while implementing hooks)
     */
    c = new Component(VNode.props);
    VNode._component = c;
    c.render = getRenderer;
    c.constructor = fn;
    c.props = VNode.props;
    c._depth = ++meta.depth;
  } else {
    c = VNode._component;
  }

  c._VNode = VNode;
  plugins.hookSetup(c);
  nextVNode = coerceToVNode(c.render(VNode.props)); // remove reference of this component

  plugins.hookSetup(null);
  return nextVNode;
}

function getRenderer(props) {
  return this.constructor(props);
}

function $runGetDerivedStateFromProps(componentClass, props, state) {
  const get = componentClass.getDerivedStateFromProps;

  if (get != null) {
    return assign({}, get(props, state));
  }

  return null;
}

function applyCurrentState(component, cls, VNode) {
  const componentStateBeforeRender = component.state || EMPTY_OBJ;
  const nextState = assign({}, componentStateBeforeRender, component._nextState || EMPTY_OBJ);
  const ns = $runGetDerivedStateFromProps(cls, VNode.props, nextState);

  if (ns) {
    assign(nextState, ns);
  }

  return nextState;
}

function isClassComponent(type) {
  const proto = type.prototype;
  return !!(proto && proto.render);
}

function diffChildren(newVNode, oldVNode, parentDom, meta) {
  if (newVNode.type === NULL_TYPE) return;
  const newChildren = newVNode._children || EMPTY_ARRAY;
  const oldChildren = (oldVNode || EMPTY_OBJ)._children || EMPTY_ARRAY;
  if (newChildren === oldChildren) return;
  return diffEachChild(newVNode, newChildren, oldChildren, parentDom, meta);
}

function diffEachChild(newParentVNode, newChildren, oldChildren, parentDom, meta) {
  const isFragment = newParentVNode.type === Fragment;
  const newChildrenLen = newChildren.length;
  const oldChildrenLen = oldChildren.length;
  const larger = Math.max(newChildrenLen, oldChildrenLen);
  const lastSibling = isFragment ? meta.next || (getDom(oldChildren[oldChildrenLen - 1]) || EMPTY_OBJ).nextSibling : null;

  for (let i = 0; i < larger; i++) {
    const newChild = newChildren[i] || (i < newChildrenLen ? createElement(NULL_TYPE) : null);
    const unkeyedOldChild = oldChildren[i];
    let oldChild = unkeyedOldChild || EMPTY_OBJ;
    let next = (getDom(oldChild) || EMPTY_OBJ).nextSibling || lastSibling;
    const nextMeta = assign({}, meta, {
      next
    });
    diff(newChild, oldChild, parentDom, false, nextMeta);
  }
}

function getDom(VNode) {
  if (!VNode || VNode === EMPTY_OBJ) return;

  while (isFn(VNode.type)) {
    VNode = VNode._renders;
  }

  if (VNode.type === Fragment) {
    const children = VNode._children || EMPTY_ARRAY;
    return getDom(children[children.length - 1]);
  }

  return VNode._dom;
}

function unmount(VNode, meta, recursionLevel) {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;
  recursionLevel = recursionLevel || 0;
  setRef(VNode.ref, null);
  unmount(VNode._renders, meta, recursionLevel);
  const component = VNode._component;

  if (component != null) {
    /** maybe disable setState for this component? */
    component.setState = Fragment;
    component.forceUpdate = Fragment;
    /** todo check for side effects */

    component._VNode = null;
    scheduleLifeCycleCallbacks({
      name: LIFECYCLE_WILL_UNMOUNT,
      bind: component
    });
  }

  const childArray = VNode._children;

  _processNodeCleanup(VNode, meta, recursionLevel);

  if (childArray) {
    const cl = childArray.length;

    for (let i = 0; i < cl; i++) {
      const child = childArray[i];
      unmount(child, meta, recursionLevel + 1);
    }

    childArray.length = 0;
  }
  /*#__NOINLINE__*/

}

function isSimplestVNode(VNode) {
  return typeof VNode.type != "function";
}

function _processNodeCleanup(VNode, meta, recursionLevel) {
  if (isSimplestVNode(VNode)) {
    const dom = VNode._dom;

    if (dom != null) {
      clearListeners(VNode, dom, meta);
      meta.batch.push({
        node: dom,
        action: recursionLevel ?
        /** if the parent element is already being unmounted, all we need to do is
        clear the child element's listeners
         */
        BATCH_MODE_CLEAR_POINTERS : BATCH_MODE_REMOVE_ELEMENT,
        VNode: VNode
      });
    }
  }
}

function clearListeners(VNode, dom, meta) {
  const props = VNode.props;

  for (const prop in props) {
    if (prop[0] === "o" && prop[1] === "n") {
      meta.batch.push({
        action: BATCH_MODE_REMOVE_ATTRIBUTE,
        node: dom,
        attr: prop
      });
    }
  }
}

/**
 *
 * @param newVNode current state of dom represented as virtual nodes
 * @param oldVNode last state of dom represented as virtual nodes
 * @param parentDom parent dom element to append child on
 * @param force true if Component#forceUpdate()  was called
 * @param meta random data useful for tagging vnodes
 */

function diff(newVNode, oldVNode, parentDom, force, meta) {
  if (newVNode == null || typeof newVNode === "boolean") {
    unmount(oldVNode, meta);
    return;
  }

  if (!isValidVNode(newVNode)) {
    return null;
  }

  if (oldVNode === newVNode) {
    return newVNode._dom;
  }

  oldVNode = oldVNode || EMPTY_OBJ;
  let oldType = oldVNode.type;
  let newType = newVNode.type;
  let isComplex = isFn(newType);

  if (newType === oldType && isComplex) {
    newVNode._component = oldVNode._component;
  }

  newVNode._parentDom = parentDom;

  if (newType !== oldType) {
    // type differs, either different dom nodes or different function/class components
    if (!meta.next) {
      const next = getDom(oldVNode);
      meta.next = (next || EMPTY_OBJ).nextSibling;
    }

    unmount(oldVNode, meta);
    oldVNode = EMPTY_OBJ;
  }

  const tmp = newVNode;

  if (typeof newVNode.props !== "string" && newType !== NULL_TYPE) {
    /** if we have a function/class Component, get the next rendered VNode */
    newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);
    meta.isSvg = newVNode.type === "svg" || meta.isSvg;
  }

  if (isFn(oldVNode.type)) {
    // also get the next rendered VNode from the old VNode
    oldVNode = oldVNode._renders;
  }

  if (newVNode !== tmp) {
    /** SCU returned False */
    if (newVNode === EMPTY_OBJ) return; // we received a new VNode from calling Component.render, start a new diff

    return diff(newVNode, oldVNode, parentDom, force, meta);
  }
  /** normalize VNode.props.children */


  newVNode._children = flattenVNodeChildren(newVNode);
  oldType = oldVNode.type;
  newType = newVNode.type;

  if (oldType !== newType) {
    oldVNode = null;
  }

  let dom;

  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
  } else {
    diffDomNodes(newVNode, oldVNode, parentDom, meta);
    dom = newVNode._dom;
    meta.isSvg = newType != "foreignObject" && meta.isSvg;
    diffChildren(newVNode, oldVNode, dom, meta);
    diffReferences(newVNode, oldVNode, dom);
  }

  return dom;
}

function render(VNode, parentDom) {
  let old;
  const normalizedVNode = createElement(Fragment, old
  /** shorthand for null  */
  , [VNode]);

  if (parentDom.hasChildNodes()) {
    // hydrate is unstable right now, just clear the dom and start afresh
    clearDOM(parentDom);
  }

  const batchQueue = [];
  diff(normalizedVNode, old, parentDom, false, {
    depth: 0,
    batch: batchQueue,
    isSvg: parentDom.ownerSVGElement !== undefined
  }); // parentDom._hosts = normalizedVNode;

  onDiff(batchQueue);
}
/**@todo fix hydrate */

const ignore = ["boolean", "string", "number"];
function createElementIfNeeded(x, props) {
  if (x == null || ignore.indexOf(typeof x) > -1) return x;
  if (x.constructor === undefined) return x;
  return createElement(x, props);
}

class AsyncComponent extends Component {
  componentDidMount() {
    this._init();
  }

  componentDidUpdate(prevProps) {
    const prevPromise = prevProps && (prevProps.promise || prevProps.componentPromise);
    const currPromise = this.props.promise || this.props.componentPromise;
    if (prevPromise === currPromise) return;

    this._init();
  }

  _init() {
    this.setState({
      inProgress: true
    });
    const prom = this.props.promise || this.props.componentPromise;
    prom().then(component => {
      this.setState({
        render: component,
        inProgress: false
      });
    }).catch(x => this.setState({
      error: true,
      inProgress: false
    }));
  }

  render(props, state) {
    if (state.inProgress) return createElementIfNeeded(props.fallback || props.fallbackComponent) || "Loading";
    if (state.error) return createElementIfNeeded(props.errorComponent) || "An Error Occured";
    return createElementIfNeeded(state.render, objectWithoutKeys(props, ["fallback", "fallbackComponent", "promise", "componentPromise"]));
  }

}

const pathFixRegex = /\/+$/;

function fixPath(path) {
  if (path.length === 1) return path;
  return path.replace(pathFixRegex, "");
}

const _routerSubscriptions = [];
const RouterSubscription = {
  subscribe(fun) {
    if (!_routerSubscriptions.includes(fun)) _routerSubscriptions.push(fun);
  },

  unsubscribe(fun) {
    _routerSubscriptions.splice(_routerSubscriptions.indexOf(fun), 1);
  },

  emit(e, options) {
    _routerSubscriptions.forEach(subscription => subscription(e, options));
  },

  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  }

};
function loadURL(url) {
  window.history.pushState(null, "", url);
  RouterSubscription.emit(url, {
    type: "load",
    native: false
  });
}
function redirect(url) {
  window.history.replaceState(null, "", url);
  RouterSubscription.emit(url, {
    type: "redirect",
    native: false
  });
}
class Router extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
  }

  static __emitter() {
    RouterSubscription.emit(Router.path + Router.qs, {
      type: "popstate",
      native: true
    });
  }

  static get path() {
    return location.pathname;
  }

  static get qs() {
    return location.search;
  }

  static get searchParams() {
    return new URLSearchParams(Router.qs);
  }

  static _getParams(pathParams, test) {
    const params = {};

    for (const i in pathParams) {
      params[pathParams[i]] = decodeURIComponent(test[i]);
    }

    return params;
  }

  static getCurrentParams(regexPath) {
    regexPath = createRoutePath(regexPath);
    const pathParams = regexPath.params;
    const test = regexPath.regex.exec(Router.path);
    return test ? Router._getParams(pathParams, test) : {};
  }

  componentDidMount() {
    RouterSubscription.subscribe(this._routeChangeHandler);
    window.addEventListener("popstate", Router.__emitter);

    this._routeChangeHandler(null);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", Router.__emitter);
    RouterSubscription.unsubscribe(this._routeChangeHandler);
  }

  _notFoundComponent() {
    return createElement("div", null, `The Requested URL "${Router.path}" was not found`);
  }

  _routeChangeHandler(_e) {
    const renderPath = fixPath(Router.path);
    const children = this.props.children;
    let child = [];
    children.forEach(x => {
      const childProps = x.props;
      const pathinfo = createRoutePath(childProps.match);
      const test = pathinfo.regex.exec(renderPath);

      if (test) {
        const _childProps = x.props;

        const params = Router._getParams(pathinfo.params, test);

        child.push(createElementIfNeeded(_childProps.component, assign({}, x.props, {
          params
        })));
      }
    });

    if (!child.length) {
      child = createElement(this.props.fallbackComponent || this._notFoundComponent);
    }

    this.setState({
      child
    });
  }

  render(_, state) {
    const child = state.child;
    return createElement(Fragment, null, child);
  }

}

function _absolutePath(route) {
  return RegExp(`^${route}(/?)$`);
}

function createRoutePath(pathString) {
  if (pathString.regex != null) return pathString;
  pathString = fixPath(pathString);
  const params = {};
  let i = 0;
  const pathRegex = pathString.split("/").map(partialPath => {
    if (partialPath[0] === ":") {
      // param matcher
      params[++i] = partialPath.substr(1); // matches will start at 1

      return "([^?\\/]+)"; //match all non whitespace lazily
    }

    return partialPath;
  }).join("/");
  return {
    regex: _absolutePath(pathRegex),
    params
  };
}

function onLinkClick(e) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return;
  }

  if (e.stopImmediatePropagation) {
    e.stopImmediatePropagation();
  }

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  e.preventDefault();
  const el = new URL(this.href, location.href);
  const href = el.pathname + el.search + el.hash;
  loadURL(href);
}

function A(props) {
  const href = props.href;

  if (href != null) {
    props.onClick = onLinkClick;
  }

  return createElement("a", props);
}
const Path = {};

function argsChanged(oldArgs, newArgs) {
  return !oldArgs || newArgs.some((arg, index) => arg !== oldArgs[index]);
}
function getCurrentHookValueOrSetDefault(hookData, currentHookIndex, defaultValues) {
  return hookData[currentHookIndex] || (hookData[currentHookIndex] = consumeCallable(0, defaultValues));
}
function consumeCallable(arg, maybeCallable) {
  return typeof maybeCallable === "function" ? maybeCallable(arg) : maybeCallable;
}

/**
 * This ensures that we begin our render work  even if we don't get an animation frame for 100ms
 * this could happen in cases like we're in an inactive tab
 * but we need to render the component and it's children
 * as we might delay some side effects
 * however if the user wishes to have the rendering stop until the tab is active
 * they can set `config.scheduleRender` to `requestAnimationFrame`
 */

function reqAnimFrame(cb) {
  const done = () => {
    cancelAnimationFrame(raf);
    clearTimeout(timeout);
    cb();
  };

  let raf;
  let timeout;
  timeout = setTimeout(done, config.RAF_TIMEOUT);
  raf = requestAnimationFrame(done);
}

let hookIndex = 0;
let hookCandidate = null;
const rafPendingCallbacks = [];
function runEffectCleanup(effect) {
  // only called if the effect itself returns a function
  const cl = effect.cleanUp;

  if (typeof cl === "function") {
    cl();
    effect.cleanUp = null;
  }
}
function runHookEffectAndAssignCleanup(effect) {
  let ret = effect.cb;

  if (ret && typeof (ret = ret()) === "function") {
    effect.cleanUp = ret;
  } // make sure we can't run this effect again


  effect.cb = null;
}
function effectCbHandler(effect) {
  // we run this cleanup first to ensure any older effect has been successfully completed
  // an effect will be completed when both it's callback and it's cleanup (if provided have been finished)
  // only run cleanup on unresolved effects
  // i.e effects that have their dependency arrays updated
  effect.resolved || runEffectCleanup(effect);
  runHookEffectAndAssignCleanup(effect);
}

function scheduleEffects() {
  rafPendingCallbacks.forEach(x => {
    for (const i in x) {
      const value = x[i];
      effectCbHandler(value);
    }
  });
  rafPendingCallbacks.length = 0;
}

const effectScheduler = config.debounceEffect || (HAS_RAF ? reqAnimFrame : defer);

function setEffectiveCallbacks() {
  effectScheduler(scheduleEffects);
}

function prepForNextHookCandidate(c) {
  hookCandidate = c;
  hookIndex = 0; // initialize hooks data if this is the first render

  c && (c._hooksData || (c._hooksData = []));
}

function getHookStateAtCurrentRender() {
  return [hookCandidate, hookIndex++];
} // todo manage sideEffects

addPluginCallback("hookSetup", prepForNextHookCandidate);
addPluginCallback("diffed", setEffectiveCallbacks);
function $push(x) {
  rafPendingCallbacks.indexOf(x) === -1 && rafPendingCallbacks.push(x);
}

function useMemo(memoFunc, dependencies) {
  const state = getHookStateAtCurrentRender();
  const candidate = state[0];
  const hookIndex = state[1];
  const hookData = candidate._hooksData;
  let currentHook = hookData[hookIndex] || {};
  if (!argsChanged(currentHook.args, dependencies)) return currentHook.hookState;
  hookData[hookIndex] = null;
  currentHook = getCurrentHookValueOrSetDefault(hookData, hookIndex, () => ({
    hookState: memoFunc()
  }));
  currentHook.args = dependencies;
  return currentHook.hookState;
}

function useCallback(fn, dependencies) {
  return useMemo(() => fn, dependencies);
}

function useRef(initialValue) {
  return useMemo(() => ({
    current: initialValue
  }), []);
}

function unmount$1() {
  const pending = this._pendingEffects;

  for (const effect in pending || EMPTY_OBJ) {
    runEffectCleanup(pending[effect]);
  }

  this._pendingEffects = null;
}

function useEffect(callback, dependencies) {
  const state = getHookStateAtCurrentRender();
  const candidate = state[0];
  const hookIndex = state[1];
  const hookData = candidate._hooksData;
  let currentHook = hookData[hookIndex] || {};
  const pending = candidate._pendingEffects = candidate._pendingEffects || {};
  const oldEffect = pending[hookIndex];

  if (!argsChanged(currentHook.args, dependencies)) {
    // mark the effect as resolved
    // no cleanup will be performed (except on unmount)
    if (oldEffect) oldEffect.resolved = true;
    return;
  }

  hookData[hookIndex] = currentHook;
  currentHook.args = dependencies; // TODO
  // in case we have an unused effect (callback not called yet)
  // attempt to defer the old effect as well, maybe wrap them together in a separate effect
  // as in this case we could end up blocking the render iff -
  // - previous callback hasn't been called yet
  // - previous callback is an expensive function
  // the cleanup does not matter as we will call it right before we call the new effect
  // however it is important that we call the effect right here for now as in the rare event
  // where the callback hasn't been called, we could end up with no cleanup either
  // another approach could be to leave the uncalled function and it's cleanup and start with
  // what we have as the new effect.

  const cleanUp = oldEffect ? runHookEffectAndAssignCleanup(oldEffect) || oldEffect.cleanUp : null;
  pending[hookIndex] = {
    cb: callback,
    cleanUp
  }; // only push effect if we haven't already added it to the queue

  $push(pending);
  candidate.componentWillUnmount = unmount$1;
}

function useReducer(reducer, initialValue, setup) {
  const state = getHookStateAtCurrentRender();
  const candidate = state[0];
  const currentHookIndex = state[1];
  const hookData = candidate._hooksData;
  const currentHook = getCurrentHookValueOrSetDefault(hookData, currentHookIndex, () => ({
    hookState: setup ? setup(initialValue) : consumeCallable(void 0, initialValue)
  }));
  currentHook.args = reducer;
  return [currentHook.hookState, action => {
    const next = currentHook.args(currentHook.hookState, action);
    currentHook.hookState = next;
    candidate.setState({});
  }];
}

function useState(initialState) {
  return useReducer(consumeCallable, initialState);
}

export default Component;
export { A, AsyncComponent, Component, Fragment, Path, Router, RouterSubscription, config, createElement, createRef, createRoutePath, createElement as h, loadURL, redirect, render, useCallback, useEffect, useMemo, useReducer, useRef, useState };
//# sourceMappingURL=ui-lib.modern.js.map
