function diffEventListeners(dom, newEvents, oldEvents) {
  if (dom == null || dom instanceof Text || newEvents === oldEvents) return;

  if (dom._listeners == null) {
    dom._listeners = {};
  }

  if (newEvents == null) {
    newEvents = EMPTY_OBJ;
  }

  if (oldEvents == null) {
    oldEvents = EMPTY_OBJ;
  }

  for (const event in oldEvents) {
    if (newEvents[event] == null) {
      delete dom._listeners[event];
      dom.removeEventListener(event, eventListenerProxy);
    }
  }

  for (const event in newEvents) {
    const listener = newEvents[event];
    const oldListener = oldEvents[event];

    if (listener != null && oldListener !== listener) {
      if (oldListener == null) dom.addEventListener(event, eventListenerProxy);
      dom._listeners[event] = listener;
    }
  }
}
function eventListenerProxy(e) {
  return this._listeners[e.type].call(this, e);
}

function diffDomNodes(newVNode, oldVNode, parentDom) {
  oldVNode = oldVNode || EMPTY_OBJ;
  const shouldAppend = oldVNode === EMPTY_OBJ;
  const newType = newVNode.type;
  const oldType = oldVNode.type;
  let dom;
  const oldDom = oldVNode._dom;

  if (newType !== oldType || oldDom == null) {
    dom = createDomFromVNode(newVNode);
  } else {
    dom = oldDom;
  }

  dom._VNode = newVNode;
  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode);
  copyPropsOverEntireTree(newVNode, "_dom", dom);
  setComponent_base(newVNode, dom);

  if (shouldAppend) {
    flushChangesToDomIfNeeded(newVNode, parentDom, true);
  }
}

function setComponent_base(VNode, dom) {
  if (!VNode) return;

  if (VNode._component != null) {
    VNode._component.base = dom;
  } else {
    setComponent_base(VNode._renderedBy, dom);
  }
}

function createDomFromVNode(newVNode) {
  if (typeof newVNode.props === "string") {
    return document.createTextNode("");
  } else {
    const type = newVNode.type;

    if (type === PlaceHolder) {
      return document.createComment("");
    }

    const dom = document.createElement(type);
    return dom;
  }
}

function diffAttributes(dom, newVNode, oldVNode) {
  if (newVNode.type === PlaceHolder) return;
  oldVNode = oldVNode || EMPTY_OBJ;
  const isTextNode = typeof newVNode.props === "string";

  if (isTextNode) {
    return __diffTextNodes(dom, newVNode.props, oldVNode.props);
  }

  const prevAttrs = oldVNode.props || EMPTY_OBJ;
  const nextAttrs = newVNode.props;

  if (prevAttrs != null) {
    __removeOldAttributes(dom, prevAttrs, nextAttrs);
  }

  __diffNewAttributes(dom, prevAttrs, nextAttrs);

  diffEventListeners(dom, newVNode.events, oldVNode.events);
}

const UNSAFE_ATTRS = {
  key: 1,
  ref: 1,
  children: 1
};
const attrsToFetchFromDOM = {
  value: 1,
  checked: 1
};

function __diffNewAttributes(dom, prev, next) {
  for (let attr in next) {
    if (isListener(attr) || attr in UNSAFE_ATTRS) continue;
    let newValue = next[attr];
    let oldValue = attrsToFetchFromDOM[attr] ? dom[attr] : prev[attr];
    if (newValue === oldValue) continue;
    attr = attr === "class" ? "className" : attr;

    if (attr === "className") {
      diffClass(dom, newValue, oldValue);
      continue;
    } else if (attr === "style") {
      diffStyle(dom, newValue, oldValue);
      continue;
    }

    $(dom, attr, newValue);
  }
}

function diffStyle(dom, newValue, oldValue) {
  oldValue = oldValue || "";
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

function diffClass(dom, newValue, oldValue) {
  const isArray = Array.isArray;

  if (isArray(newValue)) {
    newValue = newValue.join(" ").trim();
  }

  if (isArray(oldValue)) {
    oldValue = oldValue.join(" ").trim();
  }

  if (newValue === oldValue) return;
  $(dom, "className", newValue);
}

function __removeOldAttributes(dom, prev, next) {
  for (const i in prev) {
    if (isListener(i) || i in UNSAFE_ATTRS) continue;

    if (next[i] == null) {
      $(dom, i, null);
    }
  }
}

function __diffTextNodes(dom, newVal, oldVal) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}

function flushChangesToDomIfNeeded(newVNode, parentDom, needsAppending) {
  const nextSibVNode = newVNode._nextSibDomVNode;
  const nextSibDomNode = getClosestDom(nextSibVNode);
  const domToPlace = newVNode._dom;
  if (!domToPlace) return;

  if (needsAppending) {
    appendNodeToDocument(domToPlace, nextSibDomNode, parentDom);
    updatePointers(newVNode);
  }
}
function appendNodeToDocument(domToPlace, nextSibDomNode, parentDom) {
  let shouldAppend = true;
  let insertBefore;

  if (nextSibDomNode && nextSibDomNode !== domToPlace) {
    shouldAppend = false;
    insertBefore = nextSibDomNode;
  }

  if (!shouldAppend && insertBefore) {
    parentDom.insertBefore(domToPlace, insertBefore);
  } else {
    parentDom.appendChild(domToPlace);
  }
}

function updatePointers(newVNode) {
  const dom = newVNode._dom;

  if (newVNode._parentDom == null) {
    updateParentDomPointers(newVNode, dom.parentNode);
  }

  let sn = newVNode._nextSibDomVNode;

  if (sn == null) {
    const nextSib = dom.nextSibling;

    if (nextSib != null) {
      sn = nextSib._VNode;
    }
  }

  copyPropsOverEntireTree(sn, "_prevSibDomVNode", newVNode);
  copyPropsOverEntireTree(newVNode, "_nextSibDomVNode", sn);
  let pn = newVNode._prevSibDomVNode;

  if (pn == null) {
    const prevSib = dom.previousSibling;

    if (prevSib != null) {
      pn = prevSib._VNode;
    }
  }

  copyPropsOverEntireTree(pn, "_nextSibDomVNode", newVNode);
  copyPropsOverEntireTree(newVNode, "_prevSibDomVNode", pn);
}

function copyPropsOverEntireTree(VNode, propVal, val) {
  updateInternalVNodes(VNode, propVal, val, "_renders");
  updateInternalVNodes(VNode, propVal, val, "_renderedBy");
}
const replaceOtherProp = {
  _dom: "_FragmentDomNodeChildren",
  _FragmentDomNodeChildren: "_dom"
};
function updateInternalVNodes(VNode, prop, val, nextGetter) {
  let next = VNode;
  const replace = replaceOtherProp[prop];

  while (next) {
    if (replace) {
      next[replace] = null;
    }

    next[prop] = val;
    next = next[nextGetter];
  }
}

function $(dom, key, value) {
  if (key in dom) {
    return dom[key] = value == null ? "" : value;
  } else {
    if (value == null) return dom.removeAttribute(key);
    return dom.setAttribute(key, value);
  }
}

function updateParentDomPointers(VNode, dom) {
  if (dom == null) return;
  updateInternalVNodes(VNode, "_parentDom", dom, "_renderedBy");
}

const EMPTY_OBJ = {};
const EMPTY_ARR = [];

function _flat(arr, flattenedArray, map, removeHoles) {
  if (!arr) return flattenedArray;

  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];

    if (Array.isArray(el)) {
      _flat(el, flattenedArray, map, removeHoles);
    } else {
      if (!removeHoles || el != null) flattenedArray.push(map ? map(el) : el);
    }
  }

  return flattenedArray;
}

function flattenArray(array, map, removeHoles) {
  const flattened = [];
  return _flat(array, flattened, map, removeHoles);
}
function isListener(attr) {
  return attr[0] === "o" && attr[1] === "n";
}
const hasOwnProp = EMPTY_OBJ.hasOwnProperty;
const _Object = EMPTY_OBJ.constructor;
const assign = "assign" in Object ? _Object.assign : function Object_assign(target) {
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
const propPSD = "_prevSibDomVNode";
const propNSD = "_nextSibDomVNode";
function copyVNodePointers(newVNode, oldVNode) {
  if (oldVNode === EMPTY_OBJ || newVNode == null || oldVNode == null) return;
  const _prevSibDomVNode = oldVNode._prevSibDomVNode;
  const shouldUpdatePrevSibVNodeProps = newVNode._prevSibDomVNode == null && _prevSibDomVNode != null;

  if (shouldUpdatePrevSibVNodeProps) {
    copyPropsOverEntireTree(newVNode, propPSD, _prevSibDomVNode);
    copyPropsOverEntireTree(_prevSibDomVNode, propNSD, newVNode);
  }

  const _nextSibDomVNode = oldVNode._nextSibDomVNode;
  const shouldUpdateNextSibVNodeProps = newVNode._nextSibDomVNode == null && _nextSibDomVNode != null;

  if (shouldUpdateNextSibVNodeProps) {
    copyPropsOverEntireTree(newVNode, propNSD, _nextSibDomVNode);
    copyPropsOverEntireTree(_nextSibDomVNode, propPSD, newVNode);
  }
}
function isValidVNode(V) {
  if (!V || V.__self !== V) {
    console.warn("component not of expected type =>", V);
    return false;
  }

  return true;
}
function getClosestDom(VNode) {
  if (!VNode) return;
  const dom = VNode._dom;
  if (dom) return dom;
  const fragDom = VNode._FragmentDomNodeChildren;

  if (fragDom) {
    return _getDom(fragDom);
  }
}

function _getDom(fDom) {
  for (let i = 0; i < fDom.length; i++) {
    const e = fDom[i];

    if (Array.isArray(e)) {
      const next = _getDom(e);

      if (next) return next;
      continue;
    }

    if (e) return e;
  }
}

const PlaceHolder = Object.freeze({});
function createElement(type, props, ...children) {
  if (type == null || typeof type === "boolean") return null;

  if (props == null) {
    props = EMPTY_OBJ;
  }

  const ref = props.ref;
  const key = props.key;
  const events = typeof type === "string" ? {} : null;
  props = getPropsWithoutSpecialKeysAndInitializeEventsDict(props, events);

  let _children;

  if (children.length && props.children == null) {
    _children = flattenArray(children);
  }

  if (props.children != null) {
    _children = flattenArray([props.children]);
  }

  props.children = _children;
  return getVNode(type, props, events, key, ref);
}

function getVNode(type, props, events, key, ref) {
  const VNode = {
    type: typeof type === "string" ? type.toLowerCase() : type,
    props,
    events,
    key,
    ref,
    _dom: null,
    _children: null,
    _component: null,
    _nextSibDomVNode: null,
    _renders: null,
    _renderedBy: null,
    _prevSibDomVNode: null,
    _FragmentDomNodeChildren: null,
    _parentDom: null,
    _depth: 0,
    __self: null
  };
  VNode.__self = VNode;
  return VNode;
}

const Fragment = function Fragment() {};
const skipProps = {
  key: 1,
  ref: 1
};

function getPropsWithoutSpecialKeysAndInitializeEventsDict(props, events) {
  const obj = {};
  const shouldAddEvents = events != null;

  for (const i in props) {
    if (skipProps[i] == null) {
      obj[i] = props[i];

      if (shouldAddEvents && isListener(i)) {
        events[i.substr(2).toLowerCase()] = props[i];
      }
    }
  }

  return obj;
}

function convertToVNodeIfNeeded(VNode) {
  if (VNode == null || typeof VNode === "boolean") {
    return createElement(PlaceHolder);
  }

  if (typeof VNode === "string" || typeof VNode === "number") {
    return getVNode(null, String(VNode));
  }

  if (Array.isArray(VNode)) {
    return createElement(Fragment, null, VNode);
  }

  if (VNode._dom != null) {
    const vn = getVNode(VNode.type, VNode.props, VNode.events, VNode.key, null);
    return vn;
  }

  return VNode;
}
function flattenVNodeChildren(VNode) {
  const c = VNode.props.children;

  if (c == null && VNode.type !== Fragment) {
    return [];
  }

  return flattenArray([c], convertToVNodeIfNeeded);
}

const HAS_PROMISE = typeof Promise !== "undefined";
const HAS_RAF = typeof requestAnimationFrame !== "undefined";
const DEFAULT_FUNC = setTimeout;
const defaultRenderDeferrer = HAS_PROMISE ? Promise.prototype.then.bind(Promise.resolve()) : DEFAULT_FUNC;
const config = {
  deferImplementation: defaultRenderDeferrer,
  scheduleRender: HAS_RAF ? reqAnimFrame : defaultRenderDeferrer,
  eagerlyHydrate: true,
  beforeHookRender: null
};

function reqAnimFrame(cb) {
  return requestAnimationFrame(cb);
}

const mountCallbackQueue = [];
const updateCallbackQueue = [];
function processMountsQueue() {
  processQueue(mountCallbackQueue);
}
function processUpdatesQueue() {
  processQueue(updateCallbackQueue);
}

function processQueue(obj) {
  let cbObj;

  while (cbObj = obj.pop()) {
    __executeCallback(cbObj);
  }
}

function scheduleLifeCycleCallbacks(options) {
  const name = options.name;
  if (name === "componentDidMount") return mountCallbackQueue.push(options);else if (name === "componentDidUpdate") return updateCallbackQueue.push(options);else __executeCallback(options);
}

function __executeCallback(cbObj) {
  const args = cbObj.args;
  const component = cbObj.bind;
  const fName = cbObj.name;
  component._lastLifeCycleMethod = fName;
  const func = component[fName];
  const hasCatch = !!component.componentDidCatch;

  if (HAS_PROMISE) {
    Promise.resolve().then(() => func && func.apply(component, args)).catch(error => {
      if (hasCatch) return component.componentDidCatch(error);
      throw error;
    });
  } else {
    try {
      func.apply(component, args);
    } catch (e) {
      if (hasCatch) return component.componentDidCatch(e);
      throw e;
    }
  }
}

function unmountVNodeAndDestroyDom(VNode, skipRemove) {
  if (VNode == null || VNode === EMPTY_OBJ) return;
  unmountVNodeAndDestroyDom(VNode._renders, skipRemove);
  const component = VNode._component;

  if (!skipRemove && component != null) {
    component.setState = Fragment;
    component._VNode = null;
    scheduleLifeCycleCallbacks({
      name: "componentWillUnmount",
      bind: component
    });
  }

  let child;
  const childArray = VNode._children;

  if (childArray) {
    while (childArray.length) {
      child = childArray.pop();
      unmountVNodeAndDestroyDom(child, skipRemove);
    }
  }

  _processNodeCleanup(VNode, skipRemove);
}

function _processNodeCleanup(VNode, skipRemove) {
  const isPlaceholder = VNode.type === PlaceHolder;

  if (!skipRemove && typeof VNode.type !== "function") {
    const dom = VNode._dom;

    if (dom != null) {
      !isPlaceholder && diffEventListeners(dom, null, VNode.events);
      clearDomNodePointers(dom);
      removeNode(dom);
    }
  }

  clearVNodePointers(VNode, skipRemove);
}

const DOM_POINTERS = {
  _VNode: 1,
  _listeners: 1,
  onclick: 1
};
function clearDomNodePointers(dom) {
  _clearPointers(DOM_POINTERS, dom);
}
const VNode_POINTERS = {
  events: 1,
  _FragmentDomNodeChildren: 1,
  _children: 1,
  _component: 1,
  _depth: 1,
  _dom: 1,
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1,
  _renderedBy: 1,
  _renders: 1,
  _parentDom: 1
};
function clearVNodePointers(VNode, skipRemove) {
  if (VNode == null) return;

  if (!skipRemove) {
    var next = VNode._nextSibDomVNode;

    if (next != null) {
      const nextDom = next._dom;
      const newPrevSib = nextDom && nextDom.previousSibling;
      copyPropsOverEntireTree(next, "_prevSibDomVNode", newPrevSib && newPrevSib._VNode);
    }

    const prev = VNode._prevSibDomVNode;

    if (prev != null) {
      const prevDom = prev._dom;
      const newNextSib = prevDom && prevDom.nextSibling;
      copyPropsOverEntireTree(prev, "_nextSibDomVNode", newNextSib && newNextSib._VNode);
    }
  }

  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj, el) {
  if (el == null) return;

  for (const i in pointersObj) {
    el[i] = null;
  }
}

function removeNode(dom) {
  if (dom == null) return;
  const p = dom.parentNode;

  if (p) {
    p.removeChild(dom);
  }
}

function diffChildren(newVNode, oldVNode, parentDom, meta) {
  const newChildren = newVNode._children || EMPTY_ARR;
  const oldChildren = (oldVNode || EMPTY_OBJ)._children || EMPTY_ARR;
  return diffEachChild(newVNode, newChildren, oldChildren, parentDom, meta);
}

function diffEachChild(newParentVNode, newChildren, oldChildren, parentDom, meta) {
  const isFragment = newParentVNode.type === Fragment;
  const newChildrenLen = newChildren.length;
  const oldChildrenLen = oldChildren.length;
  const larger = Math.max(newChildrenLen, oldChildrenLen);

  for (let i = 0; i < larger; i++) {
    const newChild = newChildren[i] || (i < newChildrenLen ? createElement(PlaceHolder) : null);
    const oldChild = oldChildren[i] || EMPTY_OBJ;

    if (oldChild._nextSibDomVNode == null) {
      const _nextSibDomVNode = isFragment ? newParentVNode._nextSibDomVNode : null;

      if (_nextSibDomVNode != null) {
        updateInternalVNodes(newChild, "_nextSibDomVNode", _nextSibDomVNode, "_renderedBy");
      }
    }

    diff(newChild, oldChild, parentDom, null, meta);
    isFragment && newChild != null && updateFragmentDomPointers(newParentVNode, newChild, i);
  }

  if (isFragment && newChildrenLen) {
    const c = newParentVNode._children;
    const t = c[newChildrenLen - 1]._nextSibDomVNode;
    updateInternalVNodes(newParentVNode, "_nextSibDomVNode", t, "_renderedBy");
    updateInternalVNodes(newParentVNode, "_prevSibDomVNode", c[0]._prevSibDomVNode, "_renderedBy");
  }
}

function updateFragmentDomPointers(newParentVNode, x, index) {
  const domChild = x && (x._dom || x._FragmentDomNodeChildren);
  let arr = newParentVNode._FragmentDomNodeChildren;

  if (arr == null) {
    arr = [];
    updateInternalVNodes(newParentVNode, "_FragmentDomNodeChildren", arr, "_renderedBy");
  }

  arr[index] = domChild;
}

const RENDER_QUEUE = [];
class Component {
  constructor(props) {
    this.state = {};
    this.props = props;
  }

  render(props, state) {
    return null;
  }

  setState(nextState) {
    this._oldState = assign({}, this.state);
    this._nextState = assign({}, this.state);

    if (typeof nextState === "function") {
      const next = nextState(this._nextState, this.props);
      if (next == null) return;
      assign(this._nextState, next);
    } else {
      assign(this._nextState, nextState);
    }

    this.state = this._nextState;
    enqueueRender(this);
  }

  forceUpdate(callback) {
    const shouldForce = callback !== false;
    this.base = diff(this._VNode, assign({}, this._VNode), this._VNode._parentDom, shouldForce, {
      depth: this._depth
    });
    typeof callback === "function" && callback();
    processMountsQueue();
    processUpdatesQueue();
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

const isFn = vnType => typeof vnType === "function" && vnType !== Fragment;
function toSimpleVNode(VNode, oldVNode, forceUpdate, meta) {
  let type;

  if (VNode != null && isFn(type = VNode.type)) {
    oldVNode = oldVNode || EMPTY_OBJ;

    if (isClassComponent(type)) {
      return renderClassComponent(VNode, oldVNode, forceUpdate, meta);
    } else {
      return renderFunctionalComponent(VNode, meta);
    }
  } else {
    return VNode;
  }
}

function renderFunctionalComponent(VNode, meta) {
  let nextVNode;
  const fn = VNode.type;
  let c;

  if (!VNode._component) {
    c = new Component(VNode.props);
    VNode._component = c;
    c.render = getRenderer;
    c.constructor = fn;
    c.props = VNode.props;
  } else {
    c = VNode._component;
  }

  nextVNode = convertToVNodeIfNeeded(c.render(VNode.props));
  c._depth = ++meta.depth;
  setNextRenderedVNodePointers(nextVNode, VNode);
  return nextVNode;
}

const COPY_PROPS = {
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1
};

function setNextRenderedVNodePointers(next, VNode) {
  VNode._renders = next;

  if (next) {
    next._renderedBy = VNode;

    for (const i in COPY_PROPS) {
      next[i] = VNode[i];
    }
  }
}

function getRenderer(props) {
  return this.constructor(props);
}

function renderClassComponent(VNode, oldVNode, forceUpdate, meta) {
  let nextLifeCycle;
  const cls = VNode.type;
  let component = VNode._component;

  if (component != null) {
    if (component.shouldComponentUpdate != null && !forceUpdate) {
      const scu = component.shouldComponentUpdate(VNode.props, component._nextState || component.state);

      if (scu === false) {
        return EMPTY_OBJ;
      }
    }

    updateStateFromStaticLifeCycleMethods(component, cls, VNode);
    scheduleLifeCycleCallbacks({
      bind: component,
      name: "componentWillUpdate",
      args: [VNode.props, component._nextState]
    });
    nextLifeCycle = "componentDidUpdate";
  } else {
    nextLifeCycle = "componentDidMount";
    component = new cls(VNode.props);
    VNode._component = component;
    updateStateFromStaticLifeCycleMethods(component, cls, VNode);
    scheduleLifeCycleCallbacks({
      bind: component,
      name: "componentWillMount"
    });
    component._depth = ++meta.depth;
  }

  component._VNode = VNode;
  const oldState = component._oldState;
  const oldProps = oldVNode.props;
  component.state = component._nextState;
  component._oldState = null;
  component._nextState = null;
  component.props = VNode.props;
  const nextVNode = convertToVNodeIfNeeded(component.render(component.props, component.state));
  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === "componentDidUpdate" ? [oldProps, oldState] : []
  });
  setNextRenderedVNodePointers(nextVNode, VNode);
  return nextVNode;
}

function _runGetDerivedStateFromProps(componentClass, props, state) {
  const get = componentClass.getDerivedStateFromProps;

  if (get != null) {
    return assign({}, get(props, state));
  }

  return null;
}

function updateStateFromStaticLifeCycleMethods(component, cls, VNode) {
  const state = component.state || EMPTY_OBJ;
  const nextState = assign({}, state, component._nextState || EMPTY_OBJ);

  const ns = _runGetDerivedStateFromProps(cls, VNode.props, nextState);

  if (ns) {
    assign(nextState, ns);
  }

  component._nextState = nextState;
}

function isClassComponent(type) {
  const proto = type.prototype;
  return !!(proto && proto.render);
}

function diff(newVNode, oldVNode, parentDom, force, meta) {
  if (typeof newVNode === "boolean") newVNode = null;
  const oldVNodeISNULL = oldVNode == null;

  if (oldVNodeISNULL) {
    oldVNode = EMPTY_OBJ;
  }

  if (newVNode == null) {
    unmountVNodeAndDestroyDom(oldVNode);
    return;
  }

  if (newVNode === EMPTY_OBJ) return null;

  if (!isValidVNode(newVNode)) {
    return null;
  }

  if (oldVNode === newVNode) {
    return newVNode._dom;
  }

  copyVNodePointers(newVNode, oldVNode);
  let oldType = oldVNode.type;
  let newType = newVNode.type;
  let isComplex = isFn(newType);

  if (newType === oldType && isComplex) {
    newVNode._component = oldVNode._component;
  }

  if (newType !== oldType) {
    unmountVNodeAndDestroyDom(oldVNode);
    oldVNode = EMPTY_OBJ;
  }

  const tmp = newVNode;

  if (typeof newVNode.props !== "string" && newType !== PlaceHolder) {
    newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);
  }

  if (isFn(oldVNode.type)) {
    oldVNode = oldVNode._renders;
  }

  if (newVNode !== tmp) {
    return diff(newVNode, oldVNode, parentDom, force, meta);
  }

  newVNode._children = flattenVNodeChildren(newVNode);
  oldType = oldVNode.type;
  newType = newVNode.type;
  updateParentDomPointers(newVNode, parentDom);

  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
  } else {
    if (oldType !== newType) {
      oldVNode = null;
    }

    diffDomNodes(newVNode, oldVNode, parentDom);
    diffChildren(newVNode, oldVNode, newVNode._dom, meta);
  }

  return newVNode._dom;
}

function render(VNode, parentDom) {
  const normalizedVNode = createElement(Fragment, null, VNode);

  if (parentDom.hasChildNodes()) {
    clearDOM(parentDom);
  }

  diff(normalizedVNode, null, parentDom, false, {
    depth: 0
  });
  processMountsQueue();
  processUpdatesQueue();
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
      if (!component.__self) {
        component = createElement(component);
      }

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
    return state.render;
  }

}

function createElementIfNeeded(x) {
  if (x == null) return x;
  if (x.__self) return x;
  return createElement(x);
}

function deprecateFunction(fn, functionName, newName, apply) {
  let func = function () {
    deprecationWarning(functionName, "()' has been deprecated" + (newName ? " Use '" + newName + "()' instead" : ""));
    return fn.apply(apply, EMPTY_ARR.slice.call(arguments));
  };

  return func;
}
function deprecateGetter(O, getterName, newName) {
  const _getter = Object.getOwnPropertyDescriptor(O, newName).get.bind(O);

  Object.defineProperty(O, getterName, {
    get() {
      deprecationWarning(getterName, " has been deprecated." + (newName ? " Use '" + newName + "' instead" : ""));
      return _getter();
    }

  });
}
function deprecationWarning() {
  const args = ["[DeprecationWarning]"].concat(EMPTY_ARR.slice.call(arguments));
  console.warn.apply(console, args);
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
    for (let i = 0; i < _routerSubscriptions.length; i++) {
      if (_routerSubscriptions[i] === fun) return _routerSubscriptions.splice(i, 1);
    }
  },

  emit(e, options) {
    for (const subscription of _routerSubscriptions) {
      subscription(e, options);
    }
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
        const params = {};

        for (const i in pathinfo.params) {
          params[pathinfo.params[i]] = test[i];
        }

        child.push(createElement(_childProps.component, { ...x.props,
          params
        }));
      }
    });

    if (!child.length) {
      child = createElement(this.props.fallbackComponent || this._notFoundComponent);
    }

    this.setState({
      child
    });
  }

  render(props, state) {
    const child = state.child;
    return createElement(Fragment, null, child);
  }

}
deprecateGetter(Router, "getPath", "path");
deprecateGetter(Router, "getQs", "qs");

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
      params[++i] = partialPath.substr(1);
      return "(\\S*?)";
    }

    return partialPath;
  }).join("/");
  return {
    regex: _absolutePath(pathRegex),
    params
  };
}
const absolutePath = deprecateFunction(createRoutePath, "absolutePath", "createRoutePath");

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
  const el = new URL(e.target.href, location.href);
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
function Path(props) {
  return;
}

export default Component;
export { A, AsyncComponent, Component, Fragment, Path, Router, RouterSubscription, absolutePath, config, createElement, createRoutePath, createElement as h, loadURL, redirect, render };
//# sourceMappingURL=ui-lib.modern.js.map
