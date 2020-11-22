import {
  ComponentConstructor,
  ComponentType,
  DiffMeta,
  FunctionComponent,
  Props,
  VNode,
} from "./types/index";
import {
  EMPTY_OBJ,
  Fragment,
  LIFECYCLE_DID_MOUNT,
  LIFECYCLE_DID_UPDATE,
  LIFECYCLE_WILL_MOUNT,
  LIFECYCLE_WILL_UPDATE,
} from "./constants";

import { Component } from "./component";
import { assign } from "./util";
import { coerceToVNode } from "./create_element";
import { diffReferences } from "./ref";
import { isProvider } from "./context";
import { plugins } from "./config";
import { scheduleLifeCycleCallbacks } from "./lifeCycleCallbacks";

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
        return EMPTY_OBJ;
      }
    }
  } else {
    nextLifeCycle = LIFECYCLE_DID_MOUNT;
    c = new cls(VNode.props, meta.contextValue);
    VNode._component = c;
    c._depth = ++meta.depth;
  }
  setContext(c, meta);
  c._VNode = VNode;
  const oldState = c._oldState;
  const oldProps = oldVNode.props;

  scheduleLifeCycleCallbacks({
    bind: c,
    name: isExisting ? LIFECYCLE_WILL_UPDATE : LIFECYCLE_WILL_MOUNT,
    args: isExisting ? [VNode.props, c._nextState, meta.contextValue] : null,
  });

  c.state = applyCurrentState(c, cls, VNode);
  c._oldState = null;
  c._nextState = null;
  c.props = VNode.props;

  const nextVNode = coerceToVNode(
    c.render(c.props, c.state, meta.contextValue)
  );

  scheduleLifeCycleCallbacks({
    bind: c,
    name: nextLifeCycle,
    args:
      nextLifeCycle === LIFECYCLE_DID_UPDATE
        ? [oldProps, oldState, c.context]
        : [],
  });
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

  plugins.hookSetup(c);
  nextVNode = coerceToVNode(c.render(VNode.props, null, meta.contextValue));
  // remove reference of this component
  plugins.hookSetup(null);

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
  const proto = ((type as any) as ComponentConstructor).prototype;
  return !!(proto && proto.render);
}

function setContext(c: Component, meta: DiffMeta) {
  c._sharedContext = meta.context;
  c.context = meta.contextValue;
  const provider = meta.provider;
  provider && provider.add(c);
}
