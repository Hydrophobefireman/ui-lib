import {Component} from "./component.js";
import {plugins} from "./config.js";
import {
  BAILOUT,
  EMPTY_OBJ,
  Fragment,
  LIFECYCLE_DID_MOUNT,
  LIFECYCLE_DID_UPDATE,
  LIFECYCLE_WILL_MOUNT,
  LIFECYCLE_WILL_UPDATE,
  RENDER_MODE_SERVER,
} from "./constants.js";
import {isProvider} from "./context-utils.js";
import {coerceToVNode} from "./create_element.js";
import {scheduleLifeCycleCallbacks} from "./lifeCycleCallbacks.js";
import {diffReferences} from "./ref.js";
import type {
  ComponentConstructor,
  ComponentType,
  DiffMeta,
  FunctionComponent,
  Props,
  VNode,
} from "./types/index.js";
import {assign} from "./util.js";

export const isFn = (vnType: any): vnType is ComponentType =>
  typeof vnType === "function" && vnType !== Fragment;

export function toSimpleVNode(
  VNode: VNode,
  oldVNode: VNode,
  forceUpdate: boolean,
  meta: DiffMeta
): VNode {
  let type: VNode["type"];
  if (VNode != null && isFn((type = VNode.type))) {
    oldVNode = oldVNode || EMPTY_OBJ;
    let next: VNode;

    const contextType = (type as ComponentType).contextType;

    const provider = contextType && meta.context[contextType.$id];

    const contextValue = provider
      ? provider.props.value
      : contextType && contextType.def;

    meta.contextValue = contextValue;
    meta.provider = provider;

    if (isClassComponent(type)) {
      /** class component, call lifecycle methods */
      next = renderClassComponent(VNode, oldVNode, forceUpdate, meta);
    } else {
      /** run hooks */
      next = renderFunctionalComponent(VNode, meta);
    }
    if (next !== BAILOUT) VNode._renders = next;
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

function renderClassComponent(
  VNode: VNode,
  oldVNode: VNode,
  forceUpdate: boolean,
  meta: DiffMeta
) {
  let nextLifeCycle: "componentDidMount" | "componentDidUpdate";
  const cls = VNode.type as ComponentConstructor;
  let c = VNode._component;
  const isExisting = c != null;
  if (isExisting) {
    nextLifeCycle = LIFECYCLE_DID_UPDATE;
    /**existing component */
    if (c.shouldComponentUpdate != null && !forceUpdate) {
      const scu = c.shouldComponentUpdate(VNode.props, c._nextState || c.state);
      if (scu === false) {
        // Keep the live rendered subtree and advance all instance bookkeeping.
        // The bailout is an explicit outcome; it must never replace `_renders`.
        setContext(c, meta);
        c._VNode = VNode;
        c.props = VNode.props;
        c.state = applyCurrentState(c, cls, VNode);
        c._oldState = null;
        c._nextState = null;
        // Pending state was accepted here; an already-queued render is redundant.
        c._dirty = false;
        VNode._renders = oldVNode._renders;
        diffReferences(VNode, oldVNode, c);
        return BAILOUT;
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
  // Props-only updates have no _oldState, so the current state is the previous
  // state passed to componentDidUpdate.
  const oldState = c._oldState || c.state;
  const oldProps = oldVNode.props;
  // will{Mount,Update} are allowed in server
  // but setState still remains a noop
  scheduleLifeCycleCallbacks({
    bind: c,
    name: isExisting ? LIFECYCLE_WILL_UPDATE : LIFECYCLE_WILL_MOUNT,
    args: isExisting ? [VNode.props, c._nextState, meta.contextValue] : null,
  });

  c.state = applyCurrentState(c, cls, VNode);
  c._oldState = null;
  c._nextState = null;
  c.props = VNode.props;
  c._dirty = false;

  const nextVNode = coerceToVNode(
    c.render(c.props, c.state, meta.contextValue)
  );
  let snapshot = null;
  if (isExisting && c.getSnapshotBeforeUpdate != null) {
    snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
  }
  if (meta.mode !== RENDER_MODE_SERVER) {
    scheduleLifeCycleCallbacks({
      bind: c,
      name: nextLifeCycle,
      args: isExisting ? [oldProps, oldState, snapshot] : [],
    });
  }
  diffReferences(VNode, oldVNode, c);
  return nextVNode;
}

function renderFunctionalComponent(VNode: VNode, meta: DiffMeta) {
  let nextVNode: VNode;
  const fn = VNode.type as FunctionComponent;
  let c: Component;

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
  // Hooks' setState reads props from the instance, so it must always be current.
  c.props = VNode.props;
  setContext(c, meta);
  c._VNode = VNode;

  plugins._hookSetup(c);
  try {
    nextVNode = coerceToVNode(c.render(VNode.props, null, meta.contextValue));
    // The latest hook state was just rendered; drop a queued duplicate update.
    c._dirty = false;
  } finally {
    // A throwing render must not leave hooks usable outside a component.
    plugins._hookSetup(null);
  }

  return nextVNode;
}

function getRenderer(props: Props<any>) {
  return this.constructor(props, this.context);
}

function $runGetDerivedStateFromProps(
  componentClass: ComponentConstructor,
  props: Props<any>,
  state: any
) {
  const get = componentClass.getDerivedStateFromProps;
  if (get != null) {
    return assign({}, get(props, state));
  }
  return null;
}

function applyCurrentState(
  component: Component,
  cls: ComponentConstructor,
  VNode: VNode
): {} {
  const componentStateBeforeRender = component.state || EMPTY_OBJ;
  const nextState = assign(
    {},
    componentStateBeforeRender,
    component._nextState || EMPTY_OBJ
  );
  const ns = $runGetDerivedStateFromProps(cls, VNode.props, nextState);
  if (ns) {
    assign(nextState, ns);
  }
  return nextState;
}

function isClassComponent(type: VNode["type"]): type is ComponentType {
  const proto = (type as any as ComponentConstructor).prototype;
  return !!(proto && proto.render);
}

function setContext(c: Component, meta: DiffMeta) {
  c._sharedContext = meta.context;
  c.context = meta.contextValue;
  const provider = meta.provider;
  const previousProvider = c._contextProvider;
  if (previousProvider !== provider) {
    if (previousProvider) previousProvider.remove(c);
    c._contextProvider = provider;
    if (provider) provider.add(c);
  } else if (provider) {
    // Idempotent; keeps older call sites safe.
    provider.add(c);
  }
}
