import { VNode, Props, FunctionComponent, DiffMeta } from "./types";
import { Component } from "./component";
import { scheduleLifeCycleCallbacks } from "./lifeCycleCallbacks";
import { convertToVNodeIfNeeded, Fragment } from "./create_element";
import { EMPTY_OBJ, assign } from "./util";
import config from "./config";
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
    if (isClassComponent(type)) {
      /** class component, call lifecycle methods */
      return renderClassComponent(VNode, oldVNode, forceUpdate, meta);
    } else {
      /** Hooks - TODO */
      return renderFunctionalComponent(VNode, meta);
    }
  } else {
    /** VNode is already simple */
    return VNode;
  }
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
  } else {
    c = VNode._component;
  }
  /**TODO - implement hooks */
  // config.beforeHookRender(c);
  nextVNode = convertToVNodeIfNeeded(c.render(VNode.props));
  c._depth = ++meta.depth;

  setNextRenderedVNodePointers(nextVNode, VNode);

  return nextVNode;
}
const COPY_PROPS = {
  _nextSibDomVNode: 1,
  _prevSibDomVNode: 1,
  _fragmentParent: 1,
};
function setNextRenderedVNodePointers(next: VNode, VNode: VNode) {
  VNode._renders = next;
  if (next) {
    next._renderedBy = VNode;
    for (const i in COPY_PROPS) {
      next[i] = VNode[i];
    }
  }
}

function getRenderer(props: Props<any>) {
  return this.constructor(props);
}

function renderClassComponent(
  VNode: VNode,
  oldVNode: VNode,
  forceUpdate?: boolean,
  meta?: DiffMeta
) {
  let nextLifeCycle: "componentDidMount" | "componentDidUpdate";

  const cls = (VNode.type as unknown) as typeof Component;

  let component = VNode._component;

  if (component != null) {
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

    component._depth = ++meta.depth;
  }
  component._VNode = VNode;

  const oldState = component._oldState;
  const oldProps = oldVNode.props;

  component.state = component._nextState;

  component._oldState = null;
  component._nextState = null;
  component.props = VNode.props;

  const nextVNode = convertToVNodeIfNeeded(
    component.render(component.props, component.state)
  );
  scheduleLifeCycleCallbacks({
    bind: component,
    name: nextLifeCycle,
    args: nextLifeCycle === "componentDidUpdate" ? [oldProps, oldState] : [],
  });

  setNextRenderedVNodePointers(nextVNode, VNode);

  return nextVNode;
}

function _runGetDerivedStateFromProps(
  componentClass: typeof Component,
  props: Props<any>,
  state: any
) {
  const get = componentClass.getDerivedStateFromProps;
  if (get != null) {
    return assign({}, get(props, state));
  }
  return null;
}

function updateStateFromStaticLifeCycleMethods(
  component: Component,
  cls: typeof Component,
  VNode: VNode
): void {
  const state = component.state || EMPTY_OBJ;
  const nextState = assign({}, state, component._nextState || EMPTY_OBJ);
  const ns = _runGetDerivedStateFromProps(cls, VNode.props, nextState);
  if (ns) {
    assign(nextState, ns);
  }
  component._nextState = nextState;
}

function isClassComponent(type: VNode["type"]): boolean {
  const proto = ((type as any) as typeof Component).prototype;
  return !!(proto && proto.render);
}
