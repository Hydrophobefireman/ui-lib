import {
  Component as Component_Interface,
  ComponentChild,
  Props,
  setStateArgType,
  UIElement,
  VNode,
} from "./types";
import { assign, getFinalVnode } from "./util";
import config from "./config";
import { diff } from "./diff/index";
import { processMountsQueue } from "./lifeCycleCallbacks";
const RENDER_QUEUE: Component[] = [];
export class Component<P = {}, S = {}> implements Component_Interface<P, S> {
  constructor(props?: P) {
    this.state = {} as any;
    this.props = props as Props<P>;
  }
  _depth?: number;
  props: Props<P>;
  state: S;
  _nextState?: S;
  base?: UIElement | null;
  render(props?: Props<P>, state?: Readonly<S>): ComponentChild {
    return null;
  }
  setState<K extends keyof S>(nextState: setStateArgType<P, S, K>): void {
    this._nextState = assign({}, this.state);
    if (typeof nextState === "function") {
      const next = nextState(this._nextState, this.props);
      if (next == null) return;
      assign(this._nextState, next);
    } else {
      assign(this._nextState, nextState);
    }
    enqueueRender(this);
  }
  forceUpdate(callback?: (() => void) | false): void {
    const shouldForce = callback !== false;
    this.base = diff(
      this._VNode,
      assign({}, this._VNode),
      getParentDom(this._VNode),
      shouldForce,
      { depth: this._depth }
    );
    typeof callback === "function" && callback();
    processMountsQueue();
  }
  _VNode?: VNode<P>;
  // user shall implement these
  componentWillMount?(): void;
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  shouldComponentUpdate?(
    nextProps: Readonly<P>,
    nextState: Readonly<S>
  ): boolean;
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>): void;
  // getSnapshotBeforeUpdate?(oldProps: Readonly<P>, oldState: Readonly<S>): any;
  componentDidUpdate?(
    previousProps: Readonly<P>,
    previousState: Readonly<S>
  ): void;
  static getDerivedStateFromProps?(
    props: Readonly<object>,
    state: Readonly<object>
  ): object | null;
  componentDidCatch?(error: any): void;
  _lastLifeCycleMethod?:
    | "componentWillMount"
    | "componentDidMount"
    | "componentWillUnmount"
    | "shouldComponentUpdate"
    | "componentWillUpdate"
    | "componentDidUpdate";
  _dirty?: boolean;
}

function enqueueRender(c: Component) {
  c._dirty = true;
  if (RENDER_QUEUE.push(c) === 1) {
    config.scheduleRender(process);
  }
}

function process() {
  let p: Component;
  RENDER_QUEUE.sort((x, y) => x._depth - y._depth);
  while ((p = RENDER_QUEUE.pop())) {
    if (p._dirty) {
      p._dirty = false;
      p.forceUpdate(false);
    }
  }
}

function getParentDom(vn: VNode): Node {
  var next = vn;
  if (!next) return null;
  return next._parentDom ? next._parentDom : getParentDom(next._renders);
}
