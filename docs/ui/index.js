function diffEventListeners(dom, newEvents, oldEvents) {
  if (dom == null || dom instanceof Text || newEvents === oldEvents) return;
  if (dom._listeners == null) dom._listeners = {};

  if (newEvents != null) {
    if (dom._listeners == null) {
      dom.onclick = Fragment;
    }
  } else {
    newEvents = EMPTY_OBJ;
  }

  if (oldEvents == null) {
    oldEvents = EMPTY_OBJ;
  }

  for (var event in oldEvents) {
    if (!(event in newEvents)) {
      delete dom._listeners[event];
      dom.removeEventListener(event, eventListenerProxy);
    }
  }

  for (var _event in newEvents) {
    var listener = newEvents[_event];
    var oldListener = oldEvents[_event];

    if (oldListener !== listener) {
      if (oldListener == null) dom.addEventListener(_event, eventListenerProxy);
      dom._listeners[_event] = listener;
    }
  }
}
function eventListenerProxy(e) {
  return this._listeners[e.type].call(this, e);
}

var mountCallbackQueue = [];
var updateCallbackQueue = [];
function processMountsQueue() {
  processQueue(mountCallbackQueue);
}
function processUpdatesQueue() {
  processQueue(updateCallbackQueue);
}

function processQueue(obj) {
  var cbObj;

  while (cbObj = obj.pop()) {
    __executeCallback(cbObj);
  }
}

function scheduleLifeCycleCallbacks(options) {
  var name = options.name;
  if (name === "componentDidMount") return mountCallbackQueue.push(options);else if (name === "componentDidUpdate") return updateCallbackQueue.push(options);else __executeCallback(options);
}
var HAS_PROMISE = typeof Promise !== "undefined";

function __executeCallback(cbObj) {
  var args = cbObj.args;
  var component = cbObj.bind;
  var fName = cbObj.name;
  component._lastLifeCycleMethod = fName;
  var func = component[fName];
  var hasCatch = !!component.componentDidCatch;

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

function unmountVNodeAndDestroyDom(VNode) {
  if (VNode == null || VNode === EMPTY_OBJ) return;
  var component = VNode._component;

  if (component) {
    component.setState = Fragment;
    scheduleLifeCycleCallbacks({
      name: "componentWillUnmount",
      bind: component
    });
  }

  var child;
  var childArray = VNode._children;

  if (childArray) {
    while (childArray.length) {
      child = childArray.pop();
      unmountVNodeAndDestroyDom(child);
    }
  }

  var fragChildren = VNode._FragmentDomNodeChildren;
  unmountFragChildren(fragChildren);
  unmountNextRenderedVNode(VNode);
  var dom = VNode._dom;

  _processNodeCleanup(dom, VNode);
}

function unmountFragChildren(fragChildren) {
  if (fragChildren) {
    var fragChild;

    while (fragChildren.length) {
      fragChild = fragChildren.pop();

      if (fragChild != null) {
        if (Array.isArray(fragChild)) {
          unmountFragChildren(fragChild);
        } else {
          unmountVNodeAndDestroyDom(fragChild._VNode);
        }
      }
    }
  }
}

function unmountNextRenderedVNode(VNode) {
  if (!VNode) return;
  var nextVNode = VNode;

  while (nextVNode = nextVNode._renders) {
    unmountVNodeAndDestroyDom(nextVNode);
  }
}

function _processNodeCleanup(dom, VNode) {
  diffEventListeners(dom, null, VNode.events);
  clearDomNodePointers(dom);
  removeNode(dom);
  clearSibDomPointers(VNode);
  clearVNodePointers(VNode);
}

function clearSibDomPointers(VNode) {
  var nextVNode = VNode;

  while (nextVNode = nextVNode._renders) {
    var prevSibDomVNode = nextVNode._prevSibDomVNode;
    var nextSibDomVNode = nextVNode._nextSibDomVNode;
    prevSibDomVNode && (prevSibDomVNode._nextSibDomVNode = null);
    nextSibDomVNode && (nextSibDomVNode._prevSibDomVNode = null);
  }
}

var DOM_POINTERS = {
  _VNode: 1,
  _listeners: 1
};
function clearDomNodePointers(dom) {
  _clearPointers(DOM_POINTERS, dom);
}
var VNode_POINTERS = {
  _FragmentDomNodeChildren: 1,
  _children: 1,
  _component: 1,
  _depth: 1,
  _dom: 1,
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1,
  _renderedBy: 1,
  _renders: 1,
  _fragmentParent: 1
};
function clearVNodePointers(VNode) {
  if (VNode != null) {
    var fp = VNode._fragmentParent;

    if (fp != null) {
      if (fp._nextSibDomVNode === VNode) {
        fp._nextSibDomVNode = null;
      } else if (fp._prevSibDomVNode === VNode) {
        fp._prevSibDomVNode = null;
      }
    }
  }

  _clearPointers(VNode_POINTERS, VNode);
}

function _clearPointers(pointersObj, el) {
  if (el == null) return;

  for (var i in pointersObj) {
    el[i] = null;
  }
}

function removeNode(dom) {
  if (dom == null) return;
  var p = dom.parentNode;

  if (p) {
    p.removeChild(dom);
  }
}

function diffDomNode(newVNode, oldVNode) {
  oldVNode = oldVNode || EMPTY_OBJ;
  var newType = newVNode.type;
  var oldType = oldVNode.type;
  var dom;
  var oldDom = oldVNode._dom;

  if (newType !== oldType || oldDom == null) {
    dom = createDomFromVNode(newVNode);
  } else {
    dom = oldDom;
  }

  dom._VNode = newVNode;
  diffAttributes(dom, newVNode, oldVNode === EMPTY_OBJ ? null : oldVNode);
  updateInternalVNodes(newVNode, "_dom", dom, "_renders");
  updateInternalVNodes(newVNode, "_dom", dom, "_renderedBy");
  setComponent_base(newVNode, dom);
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
    return document.createElement(newVNode.type);
  }
}

function diffAttributes(dom, newVNode, oldVNode) {
  oldVNode = oldVNode || EMPTY_OBJ;
  var isTextNode = typeof newVNode.props === "string";

  if (isTextNode) {
    return __diffTextNodes(dom, newVNode.props, oldVNode.props);
  }

  var prevAttrs = oldVNode.props || EMPTY_OBJ;
  var nextAttrs = newVNode.props;

  if (prevAttrs != null) {
    __removeOldAttributes(dom, prevAttrs, nextAttrs);
  }

  __diffNewAttributes(dom, prevAttrs, nextAttrs);

  diffEventListeners(dom, newVNode.events, oldVNode.events);
}

var UNSAFE_ATTRS = {
  key: 1,
  ref: 1,
  children: 1
};

function isUnsafeAttr(attr) {
  return attr in UNSAFE_ATTRS;
}

function __diffNewAttributes(dom, prev, next) {
  for (var attr in next) {
    if (isListener(attr) || isUnsafeAttr(attr)) continue;
    var newValue = next[attr];
    var oldValue = prev[attr];
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
  var st = dom.style;

  if (typeof newValue === "string") {
    st.cssText = newValue;
    return;
  }

  var oldValueIsString = typeof oldValue === "string";

  if (oldValueIsString) {
    st.cssText = "";
  } else {
    for (var styleProp in oldValue) {
      if (!(styleProp in newValue)) {
        st[styleProp] = "";
      }
    }
  }

  for (var i in newValue) {
    var prop = newValue[i];

    if (oldValueIsString || prop !== oldValue[i]) {
      st[i] = prop;
    }
  }
}

function diffClass(dom, newValue, oldValue) {
  var isArray = Array.isArray;

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
  for (var i in prev) {
    if (!(i in next)) {
      $(dom, i, null);
    }
  }
}

function __diffTextNodes(dom, newVal, oldVal) {
  return newVal === oldVal || (dom.nodeValue = newVal);
}

function getFragParentSibDom(VNode) {
  var fp = VNode._fragmentParent;
  return fp && fp._nextSibDomVNode;
}

function flushChangesToDomIfNeeded(newVNode, parentDom, needsAppending) {
  var nextSibVNode = newVNode._nextSibDomVNode || getFragParentSibDom(newVNode);
  var nextSibDomNode = getClosestDom(nextSibVNode);
  var domToPlace = newVNode._dom;
  if (!domToPlace) return;

  if (needsAppending) {
    appendNodeToDocument(domToPlace, nextSibDomNode, parentDom);
    updatePointers(newVNode);
  }
}
function appendNodeToDocument(domToPlace, nextSibDomNode, parentDom) {
  var shouldAppend = true;
  var insertBefore;

  if (nextSibDomNode) {
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
  var dom = newVNode._dom;

  if (newVNode._parentDom == null) {
    updateParentDomPointers(newVNode, dom.parentNode);
  }

  var nextSib = dom.nextSibling;
  var prevSib = dom.previousSibling;

  if (nextSib != null) {
    updateAdjacentElementPointers(nextSib._VNode, dom, "_nextSibDomVNode");
    updateAdjacentElementPointers(newVNode, nextSib, "_prevSibDomVNode");
  }

  if (prevSib != null) {
    updateAdjacentElementPointers(newVNode, prevSib, "_nextSibDomVNode");
    updateAdjacentElementPointers(prevSib._VNode, dom, "_prevSibDomVNode");
  }
}

function updateAdjacentElementPointers(VNode, nextSib, propVal) {
  if (!nextSib) return;
  var sibVNode = nextSib._VNode;
  if (!sibVNode) return;
  updateInternalVNodes(sibVNode, propVal, VNode, "_renders");
  updateInternalVNodes(sibVNode, propVal, VNode, "_renderedBy");
}
var replaceOtherProp = {
  _dom: "_FragmentDomNodeChildren",
  _FragmentDomNodeChildren: "_dom"
};
function updateInternalVNodes(VNode, prop, val, nextGetter) {
  var next = VNode;
  var replace = replaceOtherProp[prop];

  if (next) {
    var fragParent = VNode._fragmentParent;

    if (shouldMirrorPropOnFragmentParent(fragParent, prop, val)) {
      fragParent[prop] = val;
    }

    if (replace) {
      next[replace] = null;
    }

    next[prop] = val;
    return updateInternalVNodes(next[nextGetter], prop, val, nextGetter);
  }
}

function shouldMirrorPropOnFragmentParent(fragParent, prop, val) {
  return fragParent != null && (prop === "_nextSibDomVNode" || prop === "_prevSibDomVNode") && (val == null || isNotACommonChild(val, fragParent));
}

function isNotACommonChild(val, fragParent) {
  if (val._fragmentParent === fragParent) {
    return false;
  }

  while (val = val._fragmentParent) {
    if (val._fragmentParent === fragParent) return false;
  }

  return true;
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

var EMPTY_OBJ = {};
var EMPTY_ARR = [];

function _flat(arr, flattenedArray, map, removeHoles) {
  if (!arr) return flattenedArray;

  for (var i = 0; i < arr.length; i++) {
    var el = arr[i];

    if (Array.isArray(el)) {
      _flat(el, flattenedArray, map, removeHoles);
    } else {
      if (!removeHoles || el != null) flattenedArray.push(map ? map(el) : el);
    }
  }

  return flattenedArray;
}

function flattenArray(array, map, removeHoles) {
  var flattened = [];
  return _flat(array, flattened, map, removeHoles);
}
function isListener(attr) {
  return attr[0] === "o" && attr[1] === "n";
}
var hasOwnProp = EMPTY_OBJ.hasOwnProperty;
var _Object = EMPTY_OBJ.constructor;
var assign = "assign" in Object ? _Object.assign : function Object_assign(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (hasOwnProp.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};
var propPSD = "_prevSibDomVNode";
var propNSD = "_nextSibDomVNode";
var renders = "_renders";
var renderedBy = "_renderedBy";
function copyVNodePointers(newVNode, oldVNode) {
  if (oldVNode === EMPTY_OBJ || newVNode == null || oldVNode == null) return;
  var _prevSibDomVNode = oldVNode._prevSibDomVNode;
  var shouldUpdatePrevSibVNodeProps = newVNode._prevSibDomVNode == null && _prevSibDomVNode != null;

  if (shouldUpdatePrevSibVNodeProps) {
    updateInternalVNodes(newVNode, propPSD, _prevSibDomVNode, renders);
    updateInternalVNodes(newVNode, propPSD, _prevSibDomVNode, renderedBy);
  }

  var _nextSibDomVNode = oldVNode.type !== Fragment ? oldVNode._nextSibDomVNode : getSibVNodeFromFragmentChildren(oldVNode["_children"]);

  var shouldUpdateNextSibVNodeProps = newVNode._nextSibDomVNode == null && _nextSibDomVNode != null;

  if (shouldUpdateNextSibVNodeProps) {
    updateInternalVNodes(newVNode, propNSD, _nextSibDomVNode, renders);
    updateInternalVNodes(newVNode, propNSD, _nextSibDomVNode, renderedBy);
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
  var dom = VNode._dom;
  if (dom) return dom;
  var fragDom = VNode._FragmentDomNodeChildren;

  if (fragDom) {
    return _getDom(fragDom);
  }
}

function _getDom(fDom) {
  for (var i = 0; i < fDom.length; i++) {
    var e = fDom[i];

    if (Array.isArray(e)) {
      var next = _getDom(e);

      if (next) return next;
      continue;
    }

    if (e) return e;
  }
}

function getSibVNodeFromFragmentChildren(children) {
  if (children == null) return;
  var length = children.length;

  while (length) {
    var child = children[length--];

    if (child) {
      if (child._dom) {
        return child._nextSibDomVNode;
      } else if (child._FragmentDomNodeChildren) {
        var fin = getFinalVnode(child) || EMPTY_OBJ;
        return getSibVNodeFromFragmentChildren(fin._children);
      }
    }
  }
}

function getFinalVnode(VNode) {
  var next = VNode;
  if (!next) return null;
  return next._renders ? getFinalVnode(next._renders) : next;
}

function createElement(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  if (type == null || typeof type === "boolean") return null;

  if (props == null) {
    props = EMPTY_OBJ;
  }

  var ref = props.ref;
  var key = props.key;
  var events = {};
  props = getPropsWithoutSpecialKeysAndInitializeEventsDict(props, events);

  if (children.length || (children = [props.children])) {
    props.children = flattenArray(children);
  }

  return getVNode(type, props, events, key, ref);
}

function getVNode(type, props, events, key, ref) {
  var VNode = {
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
    _fragmentParent: null,
    _depth: 0,
    __self: null
  };
  VNode.__self = VNode;
  return VNode;
}

function Fragment(props) {
  return props.children;
}
var skipProps = {
  key: 1,
  ref: 1
};

function getPropsWithoutSpecialKeysAndInitializeEventsDict(props, events) {
  var obj = {};

  for (var i in props) {
    if (skipProps[i] == null) {
      obj[i] = props[i];

      if (isListener(i)) {
        events[i.substr(2).toLowerCase()] = props[i];
      }
    }
  }

  return obj;
}

function convertToVNodeIfNeeded(VNode) {
  if (VNode == null || typeof VNode === "boolean") {
    return null;
  }

  if (typeof VNode === "string" || typeof VNode === "number") {
    return getVNode(null, String(VNode));
  }

  if (Array.isArray(VNode)) {
    return createElement(Fragment, null, VNode);
  }

  if (VNode._dom != null) {
    var vn = getVNode(VNode.type, VNode.props, VNode.events, VNode.key, null);
    vn._dom = VNode._dom;
    return vn;
  }

  return VNode;
}
function flattenVNodeChildren(VNode) {
  return flattenArray(VNode.props.children, convertToVNodeIfNeeded);
}

function diffChildren(newVNode, oldVNode, parentDom, meta) {
  var newChildren = newVNode._children || EMPTY_ARR;
  var oldChildren = (oldVNode || EMPTY_OBJ)._children || EMPTY_ARR;
  return diffEachChild(newVNode, newChildren, oldChildren, parentDom, meta);
}

function diffEachChild(newParentVNode, newChildren, oldChildren, parentDom, meta) {
  var isFragment = newParentVNode.type === Fragment;
  var newChildrenLen = newChildren.length;
  var oldChildrenLen = oldChildren.length;
  var larger = Math.max(newChildrenLen, oldChildrenLen);

  for (var i = 0; i < larger; i++) {
    var newChild = newChildren[i];
    var oldChild = oldChildren[i] || EMPTY_OBJ;
    var addPointers = isFragment && newChild != null;
    var oldDom = getClosestDom(oldChild);

    if (oldDom == null && newChild != null) {
      var sibDom = getNextSibDom(oldChildren, i + i, oldChildrenLen);

      var _nextSibDomVNode = (sibDom ? sibDom._VNode : newParentVNode.type === Fragment && getSibVNodeFromFragmentChildren(newParentVNode._children)) || void 0;

      if (_nextSibDomVNode !== void 0) {
        updateInternalVNodes(newChild, "_nextSibDomVNode", _nextSibDomVNode, "_renderedBy");
      }
    }

    addPointers && (newChild._fragmentParent = newParentVNode);
    diff(newChild, oldChild, parentDom, null, meta);
    isFragment && updateFragmentDomPointers(newParentVNode, newChild, i);
  }
}

function getNextSibDom(oldChildren, index, oldLen) {
  if (index >= oldLen) return null;
  var nextChild = oldChildren[index] || EMPTY_OBJ;
  var nextDom = getClosestDom(nextChild);
  return nextDom || getNextSibDom(oldChildren, index + 1, oldLen);
}

function updateFragmentDomPointers(newParentVNode, x, index) {
  var domChild = x && (x._dom || x._FragmentDomNodeChildren);
  var arr = newParentVNode._FragmentDomNodeChildren;

  if (arr == null) {
    arr = [];
    updateInternalVNodes(newParentVNode, "_FragmentDomNodeChildren", arr, "_renderedBy");
  }

  arr[index] = domChild;
}

var HAS_PROMISE$1 = typeof Promise !== "undefined";
var HAS_RAF = typeof requestAnimationFrame !== "undefined";
var DEFAULT_FUNC = setTimeout;
var defaultRenderDeferrer = HAS_PROMISE$1 ? Promise.prototype.then.bind(Promise.resolve()) : DEFAULT_FUNC;
var config = {
  deferImplementation: defaultRenderDeferrer,
  scheduleRender: HAS_RAF ? reqAnimFrame : defaultRenderDeferrer,
  eagerlyHydrate: true
};

function reqAnimFrame(cb) {
  return requestAnimationFrame(cb);
}

var RENDER_QUEUE = [];
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
      var next = nextState(this._nextState, this.props);
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
    var shouldForce = callback !== false;
    this.base = diff(this._VNode, assign({}, this._VNode), this._VNode._parentDom, shouldForce, {
      depth: this._depth
    });
    typeof callback === "function" && callback();
    processMountsQueue();
  }

}

function enqueueRender(c) {
  c._dirty = true;

  if (RENDER_QUEUE.push(c) === 1) {
    config.scheduleRender(process);
  }
}

function process() {
  var p;
  RENDER_QUEUE.sort((x, y) => x._depth - y._depth);

  while (p = RENDER_QUEUE.pop()) {
    if (p._dirty) {
      p._dirty = false;
      p.forceUpdate(false);
    }
  }
}

var isFn = vnType => typeof vnType === "function" && vnType !== Fragment;
function toSimpleVNode(VNode, oldVNode, forceUpdate, meta) {
  var type;

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
  var nextVNode;
  var fn = VNode.type;
  var c;

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

var COPY_PROPS = {
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1,
  _fragmentParent: 1
};

function setNextRenderedVNodePointers(next, VNode) {
  VNode._renders = next;

  if (next) {
    next._renderedBy = VNode;

    for (var i in COPY_PROPS) {
      next[i] = VNode[i];
    }
  }
}

function getRenderer(props) {
  return this.constructor(props);
}

function renderClassComponent(VNode, oldVNode, forceUpdate, meta) {
  var nextLifeCycle;
  var cls = VNode.type;
  var component = VNode._component;

  if (component != null) {
    if (component.shouldComponentUpdate != null && !forceUpdate) {
      var scu = component.shouldComponentUpdate(VNode.props, component._nextState || component.state);

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
  var oldState = component._oldState;
  var oldProps = oldVNode.props;
  component.state = component._nextState;
  component._oldState = null;
  component._nextState = null;
  component.props = VNode.props;
  var nextVNode = convertToVNodeIfNeeded(component.render(component.props, component.state));
  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === "componentDidUpdate" ? [oldProps, oldState] : []
  });
  setNextRenderedVNodePointers(nextVNode, VNode);
  return nextVNode;
}

function _runGetDerivedStateFromProps(componentClass, props, state) {
  var get = componentClass.getDerivedStateFromProps;

  if (get != null) {
    return assign({}, get(props, state));
  }

  return null;
}

function updateStateFromStaticLifeCycleMethods(component, cls, VNode) {
  var state = component.state || {};
  var nextState = assign({}, component._nextState || state);

  var ns = _runGetDerivedStateFromProps(cls, VNode.props, nextState);

  if (ns) {
    assign(nextState, ns);
  }

  component._nextState = nextState;
}

function isClassComponent(type) {
  var proto = type.prototype;
  return !!(proto && proto.render);
}

function diff(newVNode, oldVNode, parentDom, force, meta) {
  if (typeof newVNode === "boolean") newVNode = null;
  var newVNodeISNULL = newVNode == null;
  var oldVNodeISNULL = oldVNode == null;
  var oldType;
  var newType;
  var isComplex;
  if (newVNode === EMPTY_OBJ) return;
  copyVNodePointers(newVNode, oldVNode);

  if (newVNodeISNULL || oldVNodeISNULL || newVNode.type !== oldVNode.type) {
    unmountVNodeAndDestroyDom(oldVNode);
    oldVNode = EMPTY_OBJ;
    if (newVNodeISNULL) return null;
  }

  if (!newVNodeISNULL) {
    newType = newVNode.type;
    isComplex = isFn(newType);

    if (!isValidVNode(newVNode)) {
      return null;
    }
  }

  if (!oldVNodeISNULL) {
    oldType = oldVNode.type;
  }

  if (newVNode === oldVNode && !isComplex) {
    return newVNodeISNULL ? null : newVNode._dom;
  }

  if (newType === oldType && isComplex) {
    newVNode._component = oldVNode._component;
  }

  var tmp = newVNode;
  newVNode._children = flattenVNodeChildren(newVNode);
  newVNode = toSimpleVNode(newVNode, oldVNode, force, meta);

  if (isFn(oldVNode.type)) {
    oldVNode = oldVNode._renders;
  }

  if (newVNode == null || newVNode !== tmp) {
    return diff(newVNode, oldVNode, parentDom, force, meta);
  }

  oldType = oldVNode.type;
  newType = newVNode.type;
  updateParentDomPointers(newVNode, parentDom);

  if (newType === Fragment) {
    diffChildren(newVNode, oldVNode, parentDom, meta);
    return;
  }

  var needsAppending = true;

  if (oldType === newType) {
    diffDomNode(newVNode, oldVNode);
    diffChildren(newVNode, oldVNode, newVNode._dom, meta);
    needsAppending = false;
  } else {
    diffDomNode(newVNode, null);
    diffChildren(newVNode, null, newVNode._dom, meta);
  }

  flushChangesToDomIfNeeded(newVNode, parentDom, needsAppending);
  processUpdatesQueue();
  return newVNode._dom;
}

function render(VNode, parentDom) {
  var normalizedVNode = createElement(Fragment, null, VNode);

  if (parentDom.hasChildNodes()) {
    hydrate(normalizedVNode, parentDom);
  } else diff(normalizedVNode, null, parentDom, false, {
    depth: 0
  });

  processMountsQueue();
}
function hydrate(VNode, parentDom) {
  var fauxOldVNode = createElement(Fragment, null, convertChildNodesToVNode(parentDom));
  fauxOldVNode._children = flattenVNodeChildren(fauxOldVNode);
  var c = fauxOldVNode._children;
  fauxOldVNode._FragmentDomNodeChildren = c.map(child => child && child._dom);
  diff(VNode, fauxOldVNode, parentDom, false, {
    depth: 0
  });
}

function createVNodeFromDOM(dom) {
  var nm = dom.nodeName;

  if (nm === "#comment" || nm === "script" || nm === "style") {
    return;
  }

  if (dom instanceof Text) return dom.nodeValue;

  if (dom instanceof HTMLElement) {
    var VNode = createElement(dom.tagName, getDomAttributesAsProps(dom.attributes), convertChildNodesToVNode(dom));
    VNode._children = flattenVNodeChildren(VNode);
    dom._VNode = VNode;
    VNode._dom = dom;
    return VNode;
  }
}

function getDomAttributesAsProps(attributes) {
  var props = {};
  var length = attributes.length;

  for (var i = 0; i < length; i++) {
    var attr = attributes[i];
    var key = attr.name;
    var value = attr.value;
    props[key] = value;
  }

  return props;
}

function convertChildNodesToVNode(dom) {
  return Array.from(dom.childNodes).map(createVNodeFromDOM);
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

class AsyncComponent extends Component {
  constructor(props, context) {
    var {
      componentPromise,
      fallbackComponent
    } = props;
    super(props, context);
    this.state = {
      ready: false,
      componentPromise,
      finalComponent: null,
      fallbackComponent
    };
  }

  static getDerivedStateFromProps(props, state) {
    var s = state || {};
    if (s.componentPromise === props.componentPromise) return s;

    if (props.componentPromise != null) {
      s.componentPromise = props.componentPromise;
      s.ready = false;
      s.finalComponent = null;
    }

    return s;
  }

  render(_props, state) {
    var {
      eager = true,
      loadComponent = false
    } = _props,
        props = _objectWithoutPropertiesLoose(_props, ["eager", "loadComponent", "componentPromise", "fallbackComponent"]);

    var {
      ready,
      finalComponent
    } = state;

    if ((eager || loadComponent) && !ready) {
      this.loadComponent();
    }

    if (ready) {
      return createElement(finalComponent, props);
    }

    var fallbackProps = _objectWithoutPropertiesLoose(props, ["children"]);

    return this.state.fallbackComponent != null ? createElement(this.state.fallbackComponent, fallbackProps) : _defaultLoader;
  }

  loadComponent() {
    return this.state.componentPromise().then(ct => {
      this.setState({
        ready: true,
        finalComponent: ct
      });
    });
  }

}

var _defaultLoader = createElement("div", null, "Loading..");

var _routerSubscriptions = [];
var RouterSubscription = {
  subscribe(fun) {
    if (!_routerSubscriptions.includes(fun)) _routerSubscriptions.push(fun);
  },

  unsubscribe(fun) {
    for (var i = 0; i < _routerSubscriptions.length; i++) {
      if (_routerSubscriptions[i] === fun) return _routerSubscriptions.splice(i, 1);
    }
  },

  emit(e, options) {
    for (var subscription of _routerSubscriptions) {
      subscription(e, options);
    }
  },

  unsubscribeAll() {
    _routerSubscriptions.length = 0;
  }

};
function loadURL(url) {
  window.history.pushState(EMPTY_OBJ, document.title, url);
  RouterSubscription.emit(url, {
    type: "load",
    native: false
  });
}
function redirect(url) {
  window.history.replaceState(EMPTY_OBJ, document.title, url);
  RouterSubscription.emit(url, {
    type: "redirect",
    native: false
  });
}

class Router extends Component {
  static __emitter() {
    RouterSubscription.emit(Router.getPath + Router.getQs, {
      type: "popstate",
      native: true
    });
  }

  componentWillMount() {
    RouterSubscription.subscribe(this._routeChangeHandler);
    window.addEventListener("popstate", Router.__emitter);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", Router.__emitter);

    if (this.props.destroySubscriptionOnUnmount) {
      RouterSubscription.unsubscribeAll();
    }
  }

  absolute(path) {
    return new URL(path || "", location.protocol + "//" + location.host).toString();
  }

  getCurrentComponent() {
    var currentPath = Router.getPath;
    return this.getPathComponent(currentPath) || [];
  }

  _routeChangeHandler() {
    var [component, match] = this.getCurrentComponent();
    this.setState({
      component,
      match
    });
  }

  _notFoundComponent() {
    return createElement("div", null, "The Requested URL \"" + this.absolute(Router.getPath) + "\" was not found");
  }

  static get getPath() {
    return location.pathname;
  }

  static get getQs() {
    return location.search;
  }

  getPathComponent(route) {
    for (var obj of this.state.routes) {
      var {
        regex,
        component
      } = obj;
      var match = regex.exec(route);

      if (match) {
        return [component, match];
      }
    }

    return [];
  }

  initComponents(c) {
    var _routes = [];

    for (var child of c) {
      if (child.props != null && child.props.path != null) {
        _routes.push({
          regex: child.props.path,
          component: child
        });
      }
    }

    return _routes;
  }

  constructor(routerProps, context) {
    var {
      children,
      fallbackComponent
    } = routerProps,
        props = _objectWithoutPropertiesLoose(routerProps, ["children", "fallbackComponent"]);

    super(props, context);
    fallbackComponent = fallbackComponent || this._notFoundComponent.bind(this);
    this.state = {
      routes: this.initComponents(children),
      fallbackComponent
    };
    var [component, match] = this.getCurrentComponent();
    this.state.component = component;
    this.state.match = match;
    this._routeChangeHandler = this._routeChangeHandler.bind(this);
  }

  componentDidMount() {}

  render() {
    var c;

    var _this$props = this.props,
        _props = _objectWithoutPropertiesLoose(_this$props, ["children"]);

    var sendProps = _extends({
      match: this.state.match
    }, _props);

    if (this.state.component != null && this.state.match != null) {
      c = this.state.component;
      assign(c.props, sendProps);
    } else {
      c = createElement(this.state.fallbackComponent, sendProps);
    }

    if (!c.__self) c = createElement(c, sendProps);
    return createElement(Fragment, null, c);
  }

}

function A(props) {
  var {
    native,
    href,
    onClick
  } = props,
      p = _objectWithoutPropertiesLoose(props, ["native", "href", "onClick"]);

  var setProps = p;
  setProps.href = href;

  if (!native && href != null) {
    setProps.onClick = e => onLinkClick(e, props.href, onClick);
  }

  return createElement("a", setProps);
}

function onLinkClick(e, href, func) {
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
  loadURL(href);
  if (func != null) func(e, href);
}

function absolutePath(route) {
  return RegExp("^" + route + "(/?)$");
}

export default Component;
export { A, AsyncComponent, Component, Fragment, Router, RouterSubscription, absolutePath, config, createElement, createElement as h, hydrate, loadURL, redirect, render };
//# sourceMappingURL=ui-lib.modern.js.map
