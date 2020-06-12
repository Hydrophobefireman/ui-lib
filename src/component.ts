import {
  Component as Component_Interface,
  ComponentChild,
  Props,
  setStateArgType,
  UIElement,
  VNode,
  DOMOps,
} from "./types";
import { assign } from "./util";
import config from "./config";
import { diff } from "./diff/index";
import {
  processMountsQueue,
  processUpdatesQueue,
  onDiff,
} from "./lifeCycleCallbacks";

const RENDER_QUEUE: Component[] = [];

/** The pseudo-abstract component class */
export class Component<P = {}, S = {}> implements Component_Interface<P, S> {
  constructor(props?: P) {
    this.state = {} as any;
    this.props = props as Props<P>;
  }
  _pendingEffects?: {
    [index: number]: { cb: () => any; cleanUp?: () => any; resolved?: boolean };
  };
  // our hook data store
  _hooksData?: { args: any; hookState: any }[];
  // tracks component nesting
  _depth?: number;
  // props passed to the component
  props: Props<P>;
  // the component state
  state: S;
  // store old state to pass in `componentDidUpdate`
  _oldState?: S;
  // before applying to `Component.state`, pass the next state for `componentWillUpdate`
  _nextState?: S;
  // the DOM this component points to, returns null for a fragment as a top level child
  base?: UIElement | null;

  render(props?: Props<P>, state?: Readonly<S>): ComponentChild {
    return null;
  }

  setState<K extends keyof S>(nextState: setStateArgType<P, S, K>): void {
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

  forceUpdate(callback?: (() => void) | false): void {
    if (this._VNode == null) return;
    const batchQueue: DOMOps[] = [];
    const shouldForce = callback !== false;
    diff(
      this._VNode,
      assign({}, this._VNode),
      this._VNode._parentDom,
      shouldForce,
      { depth: this._depth, batch: batchQueue }
    ) as UIElement;
    typeof callback === "function" && callback();
    onDiff(batchQueue);
  }
  // current virtual dom
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
  // debug purposes
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
