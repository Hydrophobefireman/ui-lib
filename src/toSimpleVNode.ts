import { VNode, Props, FunctionComponent } from "./types";
import { Component } from "./component";
import { scheduleLifeCycleCallbacks } from "./lifeCycleCallbacks";
import { convertToVNodeIfNeeded, Fragment } from "./create_element";
import { EMPTY_OBJ, assign, getFinalVnode } from "./util";

export const isFn = (vnType: any) =>
  typeof vnType === "function" && vnType !== Fragment;

export function toSimpleVNode(
  VNode: VNode,
  oldVNode: VNode,
  forceUpdate: boolean,
  meta: { depth: number }
): VNode {
  if (VNode == null) return VNode;
  const type = VNode.type;
  if (isFn(type)) {
    oldVNode = oldVNode || EMPTY_OBJ;
    const proto = ((type as any) as typeof Component).prototype;
    if (proto && proto.render) {
      return convertClassComponentToSimpleVnode(
        VNode,
        oldVNode,
        forceUpdate,
        meta
      );
    } else {
      return convertFunctionalComponentToSimpleVnode(VNode, oldVNode, meta);
    }
  } else {
    return VNode;
  }
}

function convertFunctionalComponentToSimpleVnode(
  VNode: VNode,
  oldVNode: VNode,
  meta?: { depth: number }
) {
  let nextVnode: VNode;
  const fn = VNode.type as FunctionComponent;
  let c: Component;
  if (!VNode._component) {
    c = new Component(VNode.props);
    VNode._component = c;
    c.render = getRenderer;
    c.constructor = fn;
    c.props = VNode.props;
  } else {
    c = VNode._component;
  }
  nextVnode = convertToVNodeIfNeeded(c.render(VNode.props));
  c._depth = ++meta.depth;

  setNextProps(nextVnode, VNode);

  return nextVnode;
}
function setNextProps(next: VNode, VNode: VNode) {
  VNode._renders = next;

  next && (next._renderedBy = VNode);
}
function getRenderer(props: Props<any>) {
  return this.constructor(props);
}
function convertClassComponentToSimpleVnode(
  VNode: VNode,
  oldVNode: VNode,
  forceUpdate?: boolean,
  meta?: { depth: number }
) {
  let nextLifeCycle: "componentDidMount" | "componentDidUpdate";
  const cls = (VNode.type as unknown) as typeof Component;
  let component = VNode._component;
  if (component != null) {
    if (component.shouldComponentUpdate != null && !forceUpdate) {
      const scu = component.shouldComponentUpdate(
        VNode.props,
        component._nextState
      );
      if (scu === false) {
        return EMPTY_OBJ;
      }
    }
    component.base = getFinalVnode(VNode)._dom || getFinalVnode(oldVNode)._dom;
    updateStateFromStaticLifeCycleMethods(component, cls, VNode);
    scheduleLifeCycleCallbacks({
      bind: component,
      name: "componentWillUpdate",
      args: [VNode.props, component._nextState],
    });
    nextLifeCycle = "componentDidUpdate";
  } else {
    nextLifeCycle = "componentDidMount";
    component = new cls(VNode.props);
    VNode._component = component;
    updateStateFromStaticLifeCycleMethods(component, cls, VNode);
    scheduleLifeCycleCallbacks({
      bind: component,
      name: "componentWillMount",
    });
    component._VNode = VNode;

    component._depth = ++meta.depth;
  }
  const oldState = component.state;
  const oldProps = oldVNode.props;
  component.state = component._nextState;
  component._nextState = null;
  component.props = VNode.props;

  const nextVnode = convertToVNodeIfNeeded(
    component.render(component.props, component.state)
  );
  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === "componentDidUpdate" ? [oldProps, oldState] : [],
  });

  setNextProps(nextVnode, VNode);

  return nextVnode;
}

function runGetDerivedStateFromProps(
  componentClass: typeof Component,
  props: Props<any>,
  state: any
) {
  const nextState = {};
  const get = componentClass.getDerivedStateFromProps;
  if (get != null) {
    assign(nextState, get(props, state));
  }
  return nextState;
}

function updateStateFromStaticLifeCycleMethods(
  component: Component,
  cls: typeof Component,
  VNode: VNode
): void {
  const state = component.state || {};
  // component.state = state;
  const nextState = assign({}, component._nextState || state);
  component._nextState = assign(
    nextState,
    runGetDerivedStateFromProps(cls, VNode.props, nextState)
  );
}
