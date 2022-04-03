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
const Fragment = function Fragment() {};
const RENDER_MODE_CLIENT = 0;
const RENDER_MODE_SERVER = 1;

const HAS_PROMISE = typeof Promise !== "undefined";
const defer = HAS_PROMISE ? Promise.prototype.then.bind(Promise.resolve()) : f => setTimeout(f);
const HAS_RAF = typeof requestAnimationFrame === "function";
const plugins = {
  createElement: Fragment,
  _hookSetup: Fragment,
  diffStart: Fragment,
  diffEnd: Fragment,
  lifeCycle: Fragment,
  domNodeCreated: Fragment,
  componentInstance: Fragment
};
function addPluginCallback(options) {
  for (const type in options) {
    const cb = options[type];
    if (!cb) throw new Error("invalid callback: " + cb);
    let oldType = plugins[type];

    plugins[type] = function () {
      oldType.apply(0, arguments);
      cb.apply(0, arguments);
    };
  }
} //@safe

function reqAnimFrame(cb) {
  const done = e => {
    cancelAnimationFrame(raf);
    clearTimeout(timeout);
    cb();
  };

  let raf;
  let timeout = setTimeout(done, config.RAF_TIMEOUT);
  raf = requestAnimationFrame(done);
}
const config = {
  // we set it to null here so that we can inject our own global
  window: typeof window !== "undefined" ? window : null,
  scheduleRender: HAS_RAF ? reqAnimFrame : defer,
  warnOnUnmountRender: false,
  RAF_TIMEOUT: 100,
  debounceEffect: null,
  inMemoryRouter: false,
  memoryRouteStore: typeof window !== "undefined" && window.localStorage,
  unmountOnError: true,
  isSSR: typeof window === "undefined"
};

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
const assign = $Object.assign || function (target) {
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
function $push(array, x) {
  array.indexOf(x) === -1 && array.push(x);
}
function createElementChildren(args) {
  return EMPTY_ARRAY.slice.call(args, 2);
}
const create = $Object.create || function () {
  return {};
};
//   if (a == b) {
//     return true;
//   }
//   if (!a || !b) {
//     return false;
//   }
//   const aKeys = Object.keys(a);
//   const bKeys = Object.keys(b);
//   const len = aKeys.length;
//   if (bKeys.length !== len) {
//     return false;
//   }
//   for (let i = 0; i < len; i++) {
//     const key = aKeys[i];
//     if (a[key] !== b[key]) {
//       return false;
//     }
//   }
//   return true;
// }

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
  } else if ((children = createElementChildren(arguments)).length) {
    _children = flattenArray(children);
  }

  props.children = _children;
  const vnode = getVNode(type, props, key, ref);
  plugins.createElement(vnode, ref, key);
  return vnode;
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


  if (VNode._used) {
    const vn = getVNode(VNode.type, VNode.props, VNode.key);
    return vn;
  }

  VNode._used = true;
  return VNode;
}
/** return a flat array of children and normalize them */

function flattenVNodeChildren(VNode) {
  let c = VNode.props.children; // even if we are creating an empty fragment
  // we will still render a null child (`c`)
  // as it will serve as a memory for where the fragment's
  // future children OR any component that unmounts this fragment.

  const nullChildren = c == null;

  if (VNode.type !== Fragment) {
    if (nullChildren) return [];
  } else {
    if (c && !c.length) c = null;
  }

  return flattenArray([c], coerceToVNode);
}
function getVNode(type, props, key, ref) {
  return assign(create(null), {
    type,
    props,
    key,
    ref,
    _dom: null,
    _children: null,
    _component: null,
    _renders: null,
    _parentDom: null,
    _used: false,
    constructor: undefined
  });
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
    domOp({
      node: dom,
      action: BATCH_MODE_PLACE_NODE,
      refDom: meta.next,
      value: parentDom,
      VNode: newVNode
    });
  }
}

function createDomFromVNode(newVNode, meta) {
  const document = config.window.document;

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
    plugins.domNodeCreated(dom, newVNode);
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
    __removeOldAttributes(dom, prevAttrs, nextAttrs);
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
      domOp({
        node: dom,
        action: BATCH_MODE_SET_STYLE,
        value: {
          newValue,
          oldValue
        }
      });
      continue;
    }

    if (meta.mode === RENDER_MODE_SERVER && attr[0] === "o" && attr[1] === "n") {
      continue;
    }

    domOp({
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
      if (i[0] == "-") {
        st.setProperty(i, prop);
      } else st[i] = prop;
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
  domOp({
    node: dom,
    action: BATCH_MODE_SET_ATTRIBUTE,
    attr: meta.isSvg ? "class" : "className",
    value: newValue,
    isSSR: meta.mode === RENDER_MODE_SERVER
  });
}

function __removeOldAttributes(dom, prev, next) {
  for (let i in prev) {
    if (!UNSAFE_ATTRS[i] && next[i] == null && prev[i] != null) {
      const attributeRemovalMode = i === (i = i.replace(IS_SVG_ATTR, "")) ? BATCH_MODE_REMOVE_ATTRIBUTE : BATCH_MODE_REMOVE_ATTRIBUTE_NS;
      domOp({
        node: dom,
        action: attributeRemovalMode,
        attr: i
      });
    }
  }
}

function __diffTextNodes(dom, newVal, oldVal) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}
/** dom helper */


function $(dom, prop, value, isSvg, isSSR) {
  if (prop[0] === "o" && prop[1] === "n") {
    return $event(dom, prop, value);
  }

  const shouldRemove = value == null || value === false && !IS_ARIA_PROP.test(prop);

  if (!isSvg && !isSSR && prop in dom) {
    return dom[prop] = shouldRemove ? "" : value;
  } else {
    if (shouldRemove) return dom.removeAttribute(prop);
    return dom.setAttribute(prop, value);
  }
}

function $event(dom, event, listener) {
  event = event.substr(2).toLowerCase();
  const eventDict = dom._events;

  if (listener == null) {
    dom.removeEventListener(event, eventListenerProxy);
    delete eventDict[event];
  } else {
    eventDict[event] || dom.addEventListener(event, eventListenerProxy);
    eventDict[event] = listener;
  }
}

function eventListenerProxy(e) {
  return this._events[e.type].call(this, e);
}

function domOp(op) {
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
      $(dom, attr, value, false, op.isSSR);
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
      isSVGSpecificAttr ? dom.setAttributeNS("http://www.w3.org/1999/xlink", attr.toLowerCase(), value) : $(dom, attr, value, true, op.isSSR);
      break;
  } // queue is immutable, we build a new one everytime

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
  _dom: 1,
  _renders: 1,
  _parentDom: 1,
  _used: 1,
  key: 1,
  ref: 1
};

function clearDomNodePointers(dom) {
  _clearPointers(DOM_POINTERS, dom);
}

function clearVNodePointers(VNode) {
  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj, el) {
  if (el == null) return;

  for (const i in pointersObj) {
    el[i] = null;
  }
}

function warnSetState() {
  config.warnOnUnmountRender && console.warn("Component state changed after unmount", this);
}

function unmount$1(VNode, recursionLevel) {
  /** short circuit */
  if (VNode == null || VNode === EMPTY_OBJ) return;
  recursionLevel = VNode.type === Fragment || typeof VNode.props === "string" ? -1 : recursionLevel || 0;
  setRef(VNode.ref, null);
  unmount$1(VNode._renders, recursionLevel);
  const component = VNode._component;

  if (component != null) {
    /** maybe disable setState for this component? */
    component.setState = warnSetState;
    component.forceUpdate = warnSetState;
    /** todo check for side effects */

    component._VNode = null;
    scheduleLifeCycleCallbacks({
      name: LIFECYCLE_WILL_UNMOUNT,
      bind: component
    });
  }

  const childArray = VNode._children;

  _processNodeCleanup(VNode, recursionLevel);

  if (childArray) {
    const cl = childArray.length;

    for (let i = 0; i < cl; i++) {
      const child = childArray[i];
      unmount$1(child, recursionLevel + 1);
    }

    childArray.length = 0;
  }
  /*#__NOINLINE__*/

}

function isSimplestVNode(VNode) {
  return typeof VNode.type != "function";
}

function _processNodeCleanup(VNode, recursionLevel) {
  let dom;

  if (isSimplestVNode(VNode)) {
    dom = VNode._dom;

    if (dom != null) {
      clearListeners(VNode, dom);
      domOp({
        node: dom,
        action: recursionLevel > 0 ?
        /** if the parent element is already being unmounted, all we need to do is
        clear the child element's listeners
        */
        BATCH_MODE_CLEAR_POINTERS : BATCH_MODE_REMOVE_ELEMENT,
        VNode
      });
    }
  } else {
    domOp({
      action: BATCH_MODE_CLEAR_POINTERS,
      VNode,
      node: dom
    });
  }
}

function clearListeners(VNode, dom) {
  const props = VNode.props;

  for (const prop in props) {
    if (prop[0] === "o" && prop[1] === "n") {
      domOp({
        action: BATCH_MODE_REMOVE_ATTRIBUTE,
        node: dom,
        attr: prop
      });
    }
  }
}

const mountCallbackQueue = [];
const updateCallbackQueue = [];

function processLifeCycleQueue(obj) {
  const clone = obj.splice(0);
  clone.forEach(__executeCallback);
}

function scheduleLifeCycleCallbacks(options) {
  const name = options.name;
  if (name === LIFECYCLE_DID_MOUNT) return mountCallbackQueue.push(options);else if (name === LIFECYCLE_DID_UPDATE) return updateCallbackQueue.push(options);else __executeCallback(options);
}

function __executeCallback(cbObj) {
  const fName = cbObj.name;
  const component = cbObj.bind;
  const func = component[fName];
  plugins.lifeCycle(fName, component);
  component._lastLifeCycleMethod = fName;
  if (!func) return;
  const args = cbObj.args;
  const hasCatch = typeof component.componentDidCatch == "function";

  const cb = () => func.apply(component, args);

  function handleError(e) {
    if (hasCatch) return component.componentDidCatch(e);

    if (config.unmountOnError) {
      unmount$1(component._VNode);
    }

    throw e;
  }

  try {
    const ret = cb();

    if (ret && ret.then && ret.catch) {
      ret.catch(handleError);
    }
  } catch (e) {
    handleError(e);
  }
}

function onDiff() {
  plugins.diffEnd(); // run syncrhonously
  // defer(() => {

  processLifeCycleQueue(mountCallbackQueue);
  processLifeCycleQueue(updateCallbackQueue); // });
}

const RENDER_QUEUE = [];
/** The pseudo-abstract component class */

class Component {
  constructor(props, context) {
    this._pendingEffects = void 0;
    this._hooksData = void 0;
    this._depth = void 0;
    this.props = void 0;
    this.state = void 0;
    this._oldState = void 0;
    this._nextState = void 0;
    this._sharedContext = void 0;
    this.context = void 0;
    this._VNode = void 0;
    this._dirty = void 0;
    this._lastLifeCycleMethod = void 0;
    this.state = {};
    this.props = props;
    this.context = context;
    plugins.componentInstance(this, props);
  }

  render(props, state, context) {
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

  forceUpdate(callback, queuedUpdatate) {
    if (this._VNode == null) return; // isolatedForceUpdate (when the user calls it)
    // in other cases, we batch it among with other components as well, this fixes
    // a few race condition bugs that were caused by deferring the update
    // and runs them synchronously instead

    const shouldForce = callback !== false;
    const isIsolatedForceUpdate = queuedUpdatate !== true;
    plugins.diffStart(this, shouldForce);
    diff(this._VNode, assign({}, this._VNode), this._VNode._parentDom, shouldForce, {
      depth: this._depth,
      isSvg: false,
      context: this._sharedContext || {},
      mode: RENDER_MODE_CLIENT
    });
    typeof callback === "function" && callback();
    isIsolatedForceUpdate && onDiff();
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
      p.forceUpdate(false, true);
    }
  }

  onDiff();
}

let contextId = 0;
function createContext(def) {
  const $id = "$" + contextId++;

  class Provider extends Component {
    constructor(props, context) {
      super(props, context);
      this._subs = void 0;
      this._o = void 0;
      this._subs = [];
      this._o = {
        [$id]: this
      };
    }

    getChildContext() {
      return this._o;
    }

    shouldComponentUpdate(p) {
      this.props.deopt && p.value !== this.props.value && this._subs.some(x => enqueueRender(x));
      return true;
    }

    add(c) {
      const s = this._subs;
      $push(s, c);
      const old = c.componentWillUnmount;

      c.componentWillUnmount = () => {
        s.splice(s.indexOf(c), 1);
        old && old.call(c);
      };
    }

    render() {
      return createElement(Fragment, null, this.props.children);
    }

  }

  const Consumer = createConsumer();
  const context = {
    $id,
    Consumer,
    Provider: Provider,
    def
  };
  Consumer.contextType = context;
  return context;
}

function createConsumer() {
  function Consumer(props, context) {
    const children = props.children;

    if (typeof children === "function") {
      return children(context);
    }

    return children[0](context);
  }

  return Consumer;
}

function isProvider(p) {
  return typeof p.getChildContext === "function";
}

const isFn = vnType => typeof vnType === "function" && vnType !== Fragment;
function toSimpleVNode(VNode, oldVNode, forceUpdate, meta) {
  let type;

  if (VNode != null && isFn(type = VNode.type)) {
    oldVNode = oldVNode || EMPTY_OBJ;
    let next;
    const contextType = type.contextType;
    const provider = contextType && meta.context[contextType.$id];
    const contextValue = provider ? provider.props.value : contextType && contextType.def;
    meta.contextValue = contextValue;
    meta.provider = provider;

    if (isClassComponent(type)) {
      /** class component, call lifecycle methods */
      next = renderClassComponent(VNode, oldVNode, forceUpdate, meta);
    } else {
      /** run hooks */
      next = renderFunctionalComponent(VNode, meta);
    }

    VNode._renders = next;
    meta.provider = meta.contextValue = undefined;
    const c = VNode._component;

    if (c) {
      if (isProvider(c)) {
        const obj = c.getChildContext();
        meta.context = assign({}, meta.context, obj);
      }
    }

    return next;
  } else {
    /** VNode is already simple */
    return VNode;
  }
}

function renderClassComponent(VNode, oldVNode, forceUpdate, meta) {
  let nextLifeCycle;
  const cls = VNode.type;
  let c = VNode._component;
  const isExisting = c != null;

  if (isExisting) {
    nextLifeCycle = LIFECYCLE_DID_UPDATE;
    /**existing component */

    if (c.shouldComponentUpdate != null && !forceUpdate) {
      const scu = c.shouldComponentUpdate(VNode.props, c._nextState || c.state);

      if (scu === false) {
        return EMPTY_OBJ;
      }
    }
  } else {
    nextLifeCycle = LIFECYCLE_DID_MOUNT;
    c = new cls(VNode.props, meta.contextValue);

    if (meta.mode === RENDER_MODE_SERVER) {
      c.setState = c.forceUpdate = Fragment;
    }

    VNode._component = c;
    c._depth = ++meta.depth;
  }

  setContext(c, meta);
  c._VNode = VNode;
  const oldState = c._oldState;
  const oldProps = oldVNode.props; // will{Mount,Update} are allowed in server
  // but setState still remains a noop

  scheduleLifeCycleCallbacks({
    bind: c,
    name: isExisting ? LIFECYCLE_WILL_UPDATE : LIFECYCLE_WILL_MOUNT,
    args: isExisting ? [VNode.props, c._nextState, meta.contextValue] : null
  });
  c.state = applyCurrentState(c, cls, VNode);
  c._oldState = null;
  c._nextState = null;
  c.props = VNode.props;
  const nextVNode = coerceToVNode(c.render(c.props, c.state, meta.contextValue));
  let snapshot = null;

  if (isExisting && c.getSnapshotBeforeUpdate != null) {
    snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
  }

  if (meta.mode !== RENDER_MODE_SERVER) {
    scheduleLifeCycleCallbacks({
      bind: c,
      name: nextLifeCycle,
      args: isExisting ? [oldProps, oldState, snapshot] : []
    });
  }

  diffReferences(VNode, oldVNode, c);
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
    c = new Component(VNode.props, meta.contextValue);

    if (meta.mode === RENDER_MODE_SERVER) {
      c.setState = c.forceUpdate = Fragment;
    }

    VNode._component = c;
    c.render = getRenderer;
    c.constructor = fn;
    c.props = VNode.props;
    c._depth = ++meta.depth;
  } else {
    c = VNode._component;
  }

  setContext(c, meta);
  c._VNode = VNode;

  plugins._hookSetup(c);

  nextVNode = coerceToVNode(c.render(VNode.props, null, meta.contextValue)); // remove reference of this component

  plugins._hookSetup(null);

  return nextVNode;
}

function getRenderer(props) {
  return this.constructor(props, this.context);
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

function setContext(c, meta) {
  c._sharedContext = meta.context;
  c.context = meta.contextValue;
  const provider = meta.provider;
  provider && provider.add(c);
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
    unmount$1(oldVNode);
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
  newVNode._used = true;

  if (newType !== oldType) {
    // type differs, either different dom nodes or different function/class components
    if (!meta.next) {
      const next = getDom(oldVNode);
      meta.next = (next || EMPTY_OBJ).nextSibling;
    }

    unmount$1(oldVNode);
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

  diff(normalizedVNode, old, parentDom, false, {
    depth: 0,
    isSvg: parentDom.ownerSVGElement !== undefined,
    context: {},
    mode: RENDER_MODE_CLIENT
  }); // parentDom._hosts = normalizedVNode;

  onDiff();
}
/**@todo fix hydrate */

function cloneElement(VNode, props) {
  if (!VNode) return null;
  props = assign({}, VNode.props, props);
  if (arguments.length > 2) props.children = createElementChildren(arguments);
  let normalizedProps = objectWithoutKeys(props, skipProps);
  return getVNode(VNode.type, normalizedProps, props.key || VNode.key, props.ref || VNode.ref);
}

const ignore = ["boolean", "string", "number"];
function createElementIfNeeded(x, props) {
  if (x == null || ignore.indexOf(typeof x) > -1) return x;
  if (x.constructor === undefined) return recursivelyCloneVNode(x);
  return createElement(x, props);
}

function recursivelyCloneVNode(x) {
  let children;
  (children = (x = cloneElement(x)).props.children) && (x.props.children = flattenArray([children], createElementIfNeeded));
  return x;
}

const getPromise = k => k.promise || k.componentPromise;

class AsyncComponent extends Component {
  componentDidMount() {
    this._init();
  }

  componentDidUpdate(prevProps) {
    const prevPromise = prevProps && getPromise(prevProps);
    const currPromise = getPromise(this.props);
    if (prevPromise === currPromise) return;

    this._init();
  }

  _init() {
    this.setState({
      inProgress: true
    });
    const prom = getPromise(this.props);
    prom().then(component => {
      prom === getPromise(this.props) && this.setState({
        render: component,
        inProgress: false,
        error: false
      });
    }).catch(x => {
      console.error("AsyncComponent:", x);
      this.setState({
        error: true,
        inProgress: false,
        stack: x
      });
    });
  }

  render(props, state) {
    if (state.inProgress) return createElementIfNeeded(props.fallback || props.fallbackComponent) || "Loading";
    if (state.error) return createElementIfNeeded(props.errorComponent, {
      stack: this.state.stack
    }) || "An Error Occured";
    return createElementIfNeeded(state.render, objectWithoutKeys(props, ["fallback", "fallbackComponent", "promise", "componentPromise"]));
  }

}

const _routerSubscriptions = [];
const RouterSubscription = {
  _routerSubscriptions,

  subscribe(fun) {
    $push(_routerSubscriptions, fun);
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

const sessKey = "UI--ROUTE";

function routeAction(url, action) {
  if (!config.inMemoryRouter) {
    return window.history[action](null, "", url);
  } else {
    const u = new URL(url, window.location.href);
    config.memoryRouteStore.setItem(sessKey, JSON.stringify({
      path: u.pathname,
      qs: u.search
    }));
  }
}

function loadURL(url) {
  routeAction(url, "pushState");
  RouterSubscription.emit(url, {
    type: "load",
    native: false
  });
}
function redirect(url) {
  routeAction(url, "replaceState");
  RouterSubscription.emit(url, {
    type: "redirect",
    native: false
  });
}

function _absolutePath(route) {
  return RegExp(`^${route}(/?)$`);
}

const pathFixRegex = /\/+$/;
function fixPath(path) {
  if (path.length === 1) return path;
  return path.replace(pathFixRegex, "");
}
function createRoutePath(pathString) {
  if (!pathString) throw Error("Invalid value for match: " + pathString);
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

const RouteParamContext = createContext(null);
class Router extends Component {
  constructor(props) {
    super(props);
    this._previous = void 0;
    this.state = {};
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
    this.componentDidUpdate = this._setRouteMethod;
  }

  _setRouteMethod() {
    config.inMemoryRouter = !!this.props.inMemoryRouter;
  }

  static __emitter() {
    RouterSubscription.emit(Router.path + Router.qs, {
      type: "popstate",
      native: true
    });
  }

  static get path() {
    if (config.inMemoryRouter) {
      const str = config.memoryRouteStore.getItem(sessKey);
      if (!str) return "/";
      return JSON.parse(str).path || "/";
    }

    return config.window.location.pathname;
  }

  static get qs() {
    if (config.inMemoryRouter) {
      const str = config.memoryRouteStore.getItem(sessKey);
      if (!str) return "?";
      return JSON.parse(str).qs || "?";
    }

    return config.window.location.search;
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
  } // @safe


  componentDidMount() {
    this._setRouteMethod();

    RouterSubscription.subscribe(this._routeChangeHandler);
    window.addEventListener("popstate", Router.__emitter);

    this._routeChangeHandler(null);
  } // @safe


  componentWillUnmount() {
    window.removeEventListener("popstate", Router.__emitter);
    RouterSubscription.unsubscribe(this._routeChangeHandler);
  }

  _notFoundComponent() {
    return createElement("div", null, `The Requested URL "${Router.path}" was not found`);
  }

  _routeChangeHandler(_e) {
    const prev = this._previous;
    const curr = Router.path;
    this._previous = curr;
    if (prev === curr) return;
    const renderPath = fixPath(Router.path);
    const children = this.props.children;
    let child;
    let params;

    for (let i = 0; i < children.length; i++) {
      const x = children[i];
      const childProps = x.props;
      const pathinfo = createRoutePath(childProps.match);
      const test = pathinfo.regex.exec(renderPath);

      if (test) {
        const _childProps = x.props;
        params = Router._getParams(pathinfo.params, test);
        child = createElementIfNeeded(_childProps.component, assign({}, x.props, {
          params
        }));
        break;
      }
    }

    if (!child) {
      child = createElement(this.props.fallbackComponent || this._notFoundComponent);
    }

    this.setState({
      child,
      params
    });
  }

  render(_, state) {
    const child = state.child;
    return createElement(RouteParamContext.Provider, {
      //@ts-ignore
      value: {
        params: state.params,
        path: Router.path,
        search: Router.searchParams
      }
    }, child);
  }

}
const Path = {};

function onLinkClick(e, preserveScroll) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return;
  }

  if (!preserveScroll) {
    // dom event.. ok here
    window.scroll(0, 0);
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

function _call(func, arg, preserveScroll, ref) {
  return func.call(ref, arg, preserveScroll);
}

class A extends Component {
  constructor(props) {
    super(props);
    this._onClick = void 0;

    this._onClick = e => {
      const ps = this.props.preserveScroll;
      const current = e.currentTarget;

      _call(onLinkClick, e, ps, current);

      const userOnClick = this.props.onClick;
      userOnClick && _call(userOnClick, e, ps, current);
    };
  }

  render(props) {
    return createElement("a", assign({}, props, {
      onClick: !props.native && this._onClick
    }));
  }

}

function argsChanged(oldArgs, newArgs) {
  return !oldArgs || newArgs.some((arg, index) => arg !== oldArgs[index]);
}
function getCurrentHookValueOrSetDefault(hookData, currentHookIndex, defaultValues) {
  return hookData[currentHookIndex] || (hookData[currentHookIndex] = consumeCallable(0, defaultValues));
}
function consumeCallable(arg, maybeCallable) {
  return typeof maybeCallable === "function" ? maybeCallable(arg) : maybeCallable;
}

let hookIndex = 0;
let hookCandidate = null;
const rafPendingCallbacks = [];
const layoutPendingCallbacks = [];
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


  effect.resolved = true;
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

function _runEffect(arr) {
  arr.forEach(x => {
    for (const i in x) {
      const value = x[i];
      effectCbHandler(value);
    }
  });
}

function useEffectCallbacks() {
  return _runEffect(rafPendingCallbacks);
} //sync


function layoutEffectCallbacks() {
  return _runEffect(layoutPendingCallbacks);
}

const effectScheduler = HAS_RAF ? reqAnimFrame : defer;

function diffEnd() {
  const scheduler = config.debounceEffect || effectScheduler;
  layoutEffectCallbacks();
  scheduler(useEffectCallbacks);
}

function prepForNextHookCandidate(c) {
  hookCandidate = c;
  hookIndex = 0; // initialize hooks data if this is the first render

  c && (c._hooksData || (c._hooksData = []));
}

function getHookStateAtCurrentRender() {
  if (hookCandidate == null) throw new Error("Hook candidate not found, make sure you're running hooks inside a component");
  return [hookCandidate, hookIndex++];
} // todo manage sideEffects

addPluginCallback({
  _hookSetup: prepForNextHookCandidate,
  diffEnd
});

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

function useContext(ctx) {
  const state = getHookStateAtCurrentRender();
  const component = state[0];
  const index = state[1];
  const provider = component._sharedContext && component._sharedContext[ctx.$id];
  if (!provider) return ctx.def;
  const hooksData = component._hooksData;
  getCurrentHookValueOrSetDefault(hooksData, index, {
    args: null,
    hookState: false
  });
  const data = hooksData[index];

  if (!data.hookState) {
    data.hookState = true;
    provider.add(component);
  }

  return provider.props.value;
}

function _$unmount(pending, $this) {
  for (const effect in pending || EMPTY_OBJ) {
    runEffectCleanup(pending[effect]);
  }

  $this._pendingEffects = null;
}

function unmount() {
  const p = this._pendingEffects || EMPTY_OBJ;
  const pending$sync = p.sync;
  const pending$async = p.async;

  _$unmount(pending$sync, this);

  _$unmount(pending$async, this);
}

function effect(callback, dependencies, arr) {
  if (config.isSSR) return;
  const which = arr === layoutPendingCallbacks ? "sync" : "async";
  const state = getHookStateAtCurrentRender();
  const candidate = state[0];
  const hookIndex = state[1];
  const hookData = candidate._hooksData;
  let currentHook = hookData[hookIndex] || {};
  const instanceEffects = candidate._pendingEffects = candidate._pendingEffects || {
    sync: {},
    async: {}
  };
  const pending = instanceEffects[which];
  const oldEffect = pending[hookIndex];

  if (!argsChanged(currentHook.args, dependencies)) {
    // mark the effect as resolved
    // no cleanup will be performed (except on unmount)
    // @TODO CHECK IF THIS BREAKS ANYTHING
    // I REALLY NEED TO ADD TESTS
    // if (oldEffect) oldEffect.resolved = true;
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

  const cleanUp = oldEffect ? (oldEffect.resolved = false) || runHookEffectAndAssignCleanup(oldEffect) || oldEffect.cleanUp : null;
  pending[hookIndex] = {
    cb: callback,
    cleanUp
  }; // only push effect if we haven't already added it to the queue

  $push(arr, pending);

  if (!candidate.__attachedUnmount) {
    candidate.__attachedUnmount = true;
    const old = candidate.componentWillUnmount;

    if (!old) {
      candidate.componentWillUnmount = unmount;
    } else {
      candidate.componentWillUnmount = function () {
        old.call(candidate);
        unmount.call(candidate);
      };
    }
  }
}

function useEffect(callback, dependencies) {
  return effect(callback, dependencies, rafPendingCallbacks);
}

function useLayoutEffect(callback, dependencies) {
  return effect(callback, dependencies, layoutPendingCallbacks);
}

const obj = {};
function useReducer(reducer, initialValue, setup) {
  const state = getHookStateAtCurrentRender();
  const candidate = state[0];
  const currentHookIndex = state[1];
  const hookData = candidate._hooksData;
  const currentHook = getCurrentHookValueOrSetDefault(hookData, currentHookIndex, () => ({
    hookState: setup ? setup(initialValue) : consumeCallable(null, initialValue)
  }));
  return [currentHook.hookState, currentHook.args || (currentHook.args = action => {
    const next = reducer(currentHook.hookState, action);
    currentHook.hookState = next;
    candidate.setState(obj);
  })];
}

function useRef(initialValue) {
  return useMemo(() => ({
    current: initialValue
  }), []);
}

function useState(initialState) {
  return useReducer(consumeCallable, initialState);
}

function useRoute() {
  return useContext(RouteParamContext);
}

function forwardRef(C) {
  function ForwardRef(props) {
    const cloned = objectWithoutKeys(props, ["ref"]); // check if this can cause problems with hooks or not
    // TODO: maybe have a version that does it implicitly too?

    return C(cloned, props.ref) || null;
  }

  ForwardRef.__REF_FORWARDED = true;
  return ForwardRef;
}
addPluginCallback({
  createElement(VNode, ref) {
    if (VNode && VNode.type && VNode.type.__REF_FORWARDED) {
      VNode.props.ref = ref;
      VNode.ref = null;
    }
  }

});

export { A, AsyncComponent, Component, Fragment, Path, Router, RouterSubscription, addPluginCallback, config, createContext, createElement, createRef, createRoutePath, Component as default, diff, forwardRef, createElement as h, loadURL, redirect, render, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useRoute, useState };
//# sourceMappingURL=ui-lib.modern.js.map
