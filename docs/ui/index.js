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

const MODE_APPEND_CHILD = 0;
const MODE_REMOVE_CHILD = 1;
const MODE_INSERT_BEFORE = 2;
const MODE_SET_ATTRIBUTE = 3;
const MODE_REMOVE_ATTRIBUTE = 4;
const MODE_SET_STYLE = 5;
function commitDOMOps(queue) {
  const queueLen = queue.length;

  for (let i = 0; i < queueLen; i++) {
    const op = queue[i];
    const dom = op.node;
    const action = op.action;
    const refDom = op.refDom;
    const value = op.value;
    const VNode = op.VNode;

    switch (action) {
      case MODE_APPEND_CHILD:
        refDom.appendChild(dom);
        updatePointers(VNode);
        break;

      case MODE_INSERT_BEFORE:
        value.insertBefore(dom, refDom);
        updatePointers(VNode);
        break;

      case MODE_REMOVE_ATTRIBUTE:
      case MODE_SET_ATTRIBUTE:
        $(dom, op.attr, value);
        break;

      case MODE_SET_STYLE:
        diffStyle(dom, value.newValue, value.oldValue);
        break;

      case MODE_REMOVE_CHILD:
        removeNode(dom);
        break;
    }
  }

  queue.length = 0;
}

function removeNode(dom) {
  if (dom == null) return;
  const p = dom.parentNode;

  if (p) {
    p.removeChild(dom);
  }
}

function diffDomNodes(newVNode, oldVNode, parentDom, meta) {
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
  diffAttributes(dom, newVNode, shouldAppend ? null : oldVNode, meta);
  copyPropsOverEntireTree(newVNode, "_dom", dom);
  setComponent_base(newVNode, dom);

  if (shouldAppend) {
    batchAppendChild(newVNode, parentDom, meta);
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
      return document.createComment("$");
    }

    const dom = document.createElement(type);
    return dom;
  }
}

function diffAttributes(dom, newVNode, oldVNode, meta) {
  if (newVNode.type === PlaceHolder) return;
  oldVNode = oldVNode || EMPTY_OBJ;
  const isTextNode = typeof newVNode.props === "string";

  if (isTextNode) {
    return __diffTextNodes(dom, newVNode.props, oldVNode.props);
  }

  const prevAttrs = oldVNode.props || EMPTY_OBJ;
  const nextAttrs = newVNode.props;

  if (prevAttrs != null) {
    __removeOldAttributes(dom, prevAttrs, nextAttrs, meta);
  }

  __diffNewAttributes(dom, prevAttrs, nextAttrs, meta);

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

function __diffNewAttributes(dom, prev, next, meta) {
  for (let attr in next) {
    if (isListener(attr) || attr in UNSAFE_ATTRS) continue;
    let newValue = next[attr];
    let oldValue = attrsToFetchFromDOM[attr] ? dom[attr] : prev[attr];
    if (newValue === oldValue) continue;
    attr = attr === "class" ? "className" : attr;

    if (attr === "className") {
      diffClass(dom, newValue, oldValue, meta);
      continue;
    } else if (attr === "style") {
      meta.batch.push({
        node: dom,
        action: MODE_SET_STYLE,
        value: {
          newValue,
          oldValue
        }
      });
      continue;
    }

    meta.batch.push({
      node: dom,
      action: MODE_SET_ATTRIBUTE,
      attr,
      value: newValue
    });
  }
}

function diffStyle(dom, newValue, oldValue) {
  oldValue = oldValue || "";
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
    action: MODE_SET_ATTRIBUTE,
    attr: "className",
    value: newValue
  });
}

function __removeOldAttributes(dom, prev, next, meta) {
  for (const i in prev) {
    if (isListener(i) || i in UNSAFE_ATTRS) continue;

    if (next[i] == null) {
      meta.batch.push({
        node: dom,
        action: MODE_REMOVE_ATTRIBUTE,
        attr: i
      });
    }
  }
}

function __diffTextNodes(dom, newVal, oldVal) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}

function batchAppendChild(newVNode, parentDom, meta) {
  const domToPlace = newVNode._dom;
  if (!domToPlace) return;
  const nextSibVNode = newVNode._nextSibDomVNode;
  const nextSibDomNode = getClosestDom(nextSibVNode);
  let shouldAppend = true;
  let insertBefore;

  if (nextSibDomNode && nextSibDomNode !== domToPlace) {
    shouldAppend = false;
    insertBefore = nextSibDomNode;
  }

  if (!shouldAppend && insertBefore) {
    meta.batch.push({
      node: domToPlace,
      action: MODE_INSERT_BEFORE,
      refDom: insertBefore,
      value: parentDom,
      VNode: newVNode
    });
  } else {
    meta.batch.push({
      node: domToPlace,
      action: MODE_APPEND_CHILD,
      refDom: parentDom,
      VNode: newVNode
    });
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
const ariaType = /^aria[\-A-Z]/;
function $(dom, key, value) {
  const shouldRemove = value == null || value === false && !ariaType.test(key);

  if (key in dom) {
    return dom[key] = shouldRemove ? "" : value;
  } else {
    if (shouldRemove) return dom.removeAttribute(key);
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

const PlaceHolder = {};
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

function coerceToVNode(VNode) {
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

  return flattenArray([c], coerceToVNode);
}
function createRef() {
  return {
    current: null
  };
}

const HAS_PROMISE = typeof Promise !== "undefined";
const defer = HAS_PROMISE ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout.bind(window);
const config = {
  scheduleRender: defer,
  eagerlyHydrate: true,
  RAF_TIMEOUT: 100
};
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

const mountCallbackQueue = [];
const updateCallbackQueue = [];
function processMountsQueue() {
  processLifeCycleQueue(mountCallbackQueue);
}
function processUpdatesQueue() {
  processLifeCycleQueue(updateCallbackQueue);
}

function processLifeCycleQueue(obj) {
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
  if (!func) return;

  const cb = () => func.apply(component, args);

  if (HAS_PROMISE) {
    Promise.resolve().then(cb).catch(error => {
      if (hasCatch) return component.componentDidCatch(error);
      throw error;
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
  processMountsQueue();
  processUpdatesQueue();
}

function unmountVNodeAndDestroyDom(VNode, skipRemove, meta) {
  if (VNode == null || VNode === EMPTY_OBJ) return;
  setRef(VNode.ref, null);
  unmountVNodeAndDestroyDom(VNode._renders, skipRemove, meta);
  const component = VNode._component;

  if (!skipRemove && component != null) {
    component.setState = Fragment;
    component.forceUpdate = Fragment;
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
      unmountVNodeAndDestroyDom(child, skipRemove, meta);
    }
  }

  _processNodeCleanup(VNode, skipRemove, meta);
}

function _processNodeCleanup(VNode, skipRemove, meta) {
  const isPlaceholder = VNode.type === PlaceHolder;

  if (!skipRemove && typeof VNode.type !== "function") {
    const dom = VNode._dom;

    if (dom != null) {
      !isPlaceholder && diffEventListeners(dom, null, VNode.events);
      clearDomNodePointers(dom);
      meta.batch.push({
        node: dom,
        action: MODE_REMOVE_CHILD
      });
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

function diffChildren(newVNode, oldVNode, parentDom, meta) {
  if (newVNode.type === PlaceHolder) return;
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
    const unkeyedOldChild = oldChildren[i];
    let oldChild = unkeyedOldChild || EMPTY_OBJ;
    copyVNodePointers(newChild, unkeyedOldChild);

    if (oldChild === EMPTY_ARR) {
      const next = i + 1;
      oldChild = oldChildren[next];
    }

    if (newChild && newChild._nextSibDomVNode == null) {
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
    this._nextState = assign({}, this._nextState || this.state);

    if (typeof nextState === "function") {
      const next = nextState(this._nextState, this.props);
      if (next == null) return;
      assign(this._nextState, next);
    } else {
      assign(this._nextState, nextState);
    }

    this.state = this._nextState;
    this._nextState = null;
    enqueueRender(this);
  }

  forceUpdate(callback) {
    if (this._VNode == null) return;
    const batchQueue = [];
    const shouldForce = callback !== false;
    diff(this._VNode, assign({}, this._VNode), this._VNode._parentDom, shouldForce, {
      depth: this._depth,
      batch: batchQueue
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
  const nextVNode = coerceToVNode(component.render(component.props, component.state));
  setNextRenderedVNodePointers(nextVNode, VNode);
  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === "componentDidUpdate" ? [oldProps, oldState] : []
  });
  diffReferences(VNode, oldVNode, component);
  return nextVNode;
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
    c._depth = ++meta.depth;
  } else {
    c = VNode._component;
  }

  c._VNode = VNode;
  plugins.hookSetup(c);
  nextVNode = coerceToVNode(c.render(VNode.props));
  plugins.hookSetup(null);
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

  if (newVNode == null) {
    unmountVNodeAndDestroyDom(oldVNode, false, meta);
    return;
  }

  if (newVNode === EMPTY_OBJ) return null;

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

  if (newType !== oldType) {
    unmountVNodeAndDestroyDom(oldVNode, false, meta);
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
  let dom;

  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
  } else {
    if (oldType !== newType) {
      oldVNode = null;
    }

    diffDomNodes(newVNode, oldVNode, parentDom, meta);
    dom = newVNode._dom;
    diffChildren(newVNode, oldVNode, dom, meta);
    diffReferences(newVNode, oldVNode, dom);
  }

  return dom;
}

function render(VNode, parentDom) {
  const normalizedVNode = createElement(Fragment, null, [VNode]);

  if (parentDom.hasChildNodes()) {
    clearDOM(parentDom);
  }

  const batchQueue = [];
  diff(normalizedVNode, null, parentDom, false, {
    depth: 0,
    batch: batchQueue
  });
  onDiff(batchQueue);
}

const ignore = ["boolean", "string", "number"];
function createElementIfNeeded(x, props) {
  if (x == null || ignore.indexOf(typeof x) > -1) return x;
  if (x.__self) return x;
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
    return createElementIfNeeded(state.render, _objectWithoutKeys(props, ["fallback", "fallbackComponent", "promise", "componentPromise"]));
  }

}

function _objectWithoutKeys(obj, propArr) {
  propArr = flattenArray([propArr]);
  const ret = {};

  for (const i in obj) {
    if (propArr.indexOf(i) === -1) {
      ret[i] = obj[i];
    }
  }

  return ret;
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
    get: deprecateFunction(_getter, getterName, newName)
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

function createRouterChild(component, props) {
  return createElementIfNeeded(component, props);
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

        child.push(createRouterChild(_childProps.component, assign({}, x.props, {
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
      return "([^?\\/]+)";
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

let hookIndex = 0;
let hookCandidate = null;

function reqAnimFrame(cb) {
  let raf;
  let timeout;

  const done = () => {
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    cb();
  };

  timeout = setTimeout(done, config.RAF_TIMEOUT);
  raf = requestAnimationFrame(done);
}

const nextFrame = window.requestAnimationFrame ? reqAnimFrame : config.scheduleRender;
const rafPendingCallbacks = [];
function runEffectCleanup(effect) {
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
  }

  effect.cb = null;
}
function effectCbHandler(effect) {
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

function setEffectiveCallbacks() {
  nextFrame(scheduleEffects);
}

function prepForNextHookCandidate(c) {
  hookCandidate = c;
  hookIndex = 0;
  c && (c._hooksData || (c._hooksData = []));
}

function getHookStateAtCurrentRender() {
  return [hookCandidate, hookIndex++];
}
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

function unmount() {
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
  const tmp = {};
  let currentHook = hookData[hookIndex] || tmp;
  const pending = candidate._pendingEffects = candidate._pendingEffects || tmp;
  const oldEffect = pending[hookIndex];

  if (!argsChanged(currentHook.args, dependencies)) {
    if (oldEffect) oldEffect.resolved = true;
    return;
  }

  currentHook = getCurrentHookValueOrSetDefault(hookData, hookIndex, tmp);
  currentHook.args = dependencies;
  const cleanUp = oldEffect ? runHookEffectAndAssignCleanup(oldEffect) || oldEffect.cleanUp : null;
  pending[hookIndex] = {
    cb: callback,
    cleanUp
  };
  $push(pending);
  candidate.componentWillUnmount = unmount;
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
export { A, AsyncComponent, Component, Fragment, Path, Router, RouterSubscription, absolutePath, config, createElement, createRef, createRoutePath, createElement as h, loadURL, redirect, render, useCallback, useEffect, useMemo, useReducer, useRef, useState };
//# sourceMappingURL=ui-lib.modern.js.map
