import {
  ComponentConstructor,
  DiffMeta,
  FunctionComponent,
  Props,
  VNode,
} from "./types/index";
import {
  EMPTY_OBJ,
  LIFECYCLE_DID_MOUNT,
  LIFECYCLE_DID_UPDATE,
  LIFECYCLE_WILL_MOUNT,
  LIFECYCLE_WILL_UPDATE,
} from "./constants";
import { Fragment, coerceToVNode } from "./create_element";

import { Component } from "./component";
import { assign } from "./util";
import { diffReferences } from "./ref";
import { plugins } from "./config";
import { scheduleLifeCycleCallbacks } from "./lifeCycleCallbacks";

export const isFn = (vnType: any) =>
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
    if (isClassComponent(type)) {
      /** class component, call lifecycle methods */
      next = renderClassComponent(VNode, oldVNode, forceUpdate, meta);
    } else {
      /** run hooks */
      next = renderFunctionalComponent(VNode, meta);
    }
    VNode._renders = next;
    return next;
  } else {
    /** VNode is already simple */
    return VNode;
  }
}

function renderClassComponent(
  VNode: VNode,
  oldVNode: VNode,
  forceUpdate?: boolean,
  meta?: DiffMeta
) {
  let nextLifeCycle: "componentDidMount" | "componentDidUpdate";
  const cls = VNode.type as ComponentConstructor;
  let component = VNode._component;
  const isExisting = component != null;
  if (isExisting) {
    nextLifeCycle = LIFECYCLE_DID_UPDATE;
    /**existing component */
    if (component.shouldComponentUpdate != null && !forceUpdate) {
      const scu = component.shouldComponentUpdate(
        VNode.props,
        component._nextState || component.state
      );
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
    args: isExisting ? [VNode.props, component._nextState] : null,
  });

  component.state = applyCurrentState(component, cls, VNode);
  component._oldState = null;
  component._nextState = null;
  component.props = VNode.props;

  const nextVNode = coerceToVNode(
    component.render(component.props, component.state)
  );

  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === LIFECYCLE_DID_UPDATE ? [oldProps, oldState] : [],
  });
  diffReferences(VNode, oldVNode, component);
  return nextVNode;
}

function renderFunctionalComponent(VNode: VNode, meta?: DiffMeta) {
  let nextVNode: VNode;
  const fn = VNode.type as FunctionComponent;
  let c: Component;

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
  nextVNode = coerceToVNode(c.render(VNode.props));
  // remove reference of this component
  plugins.hookSetup(null);

  return nextVNode;
}

function getRenderer(props: Props<any>) {
  return this.constructor(props);
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

function isClassComponent(type: VNode["type"]): boolean {
  const proto = ((type as any) as ComponentConstructor).prototype;
  return !!(proto && proto.render);
}
