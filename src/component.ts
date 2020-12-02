import {
  ComponentChild,
  DOMOps,
  Props,
  UIElement,
  VNode,
  setStateArgType,
} from "./types/index";
import config, { plugins } from "./config";

import { ContextProvider } from "./types/index";
import { LifeCycleCallbacks } from "./constants";
import { assign } from "./util";
import { diff } from "./diff/index";
import { onDiff } from "./lifeCycleCallbacks";

const RENDER_QUEUE: Component[] = [];
export interface EffectsDictionary {
  [index: number]: {
    cb: () => any;
    cleanUp?: () => any;
    resolved?: boolean;
  };
}
export interface PendingEffects {
  sync: EffectsDictionary;
  async: EffectsDictionary;
}
/** The pseudo-abstract component class */
export class Component<P = {}, S = {}> {
  constructor(props: P, context?: any) {
    this.state = {} as any;
    this.props = props as Props<P>;
    this.context = context;
    plugins.componentInstance(this, props);
  }

  _pendingEffects?: PendingEffects;
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
  // context of this component and its descendants
  _sharedContext?: { [id: string]: ContextProvider };
  context?: any;

  render(props?: Props<P>, state?: Readonly<S>, context?: any): ComponentChild {
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
    plugins.diffStart(this, shouldForce);

    diff(
      this._VNode,
      assign({}, this._VNode),
      this._VNode._parentDom,
      shouldForce,
      {
        depth: this._depth,
        batch: batchQueue,
        isSvg: false,
        context: this._sharedContext || {},
      }
    ) as UIElement;
    typeof callback === "function" && callback();
    onDiff(batchQueue);
  }

  _VNode?: VNode<P>;
  static getDerivedStateFromProps?(
    props: Readonly<object>,
    state: Readonly<object>
  ): object | null;
  componentWillMount?(): void;
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  componentWillReceiveProps?(nextProps: Readonly<P>): void;
  shouldComponentUpdate?(
    nextProps: Readonly<P>,
    nextState: Readonly<S>
  ): boolean;
  componentWillUpdate?(
    nextProps: Readonly<P>,
    nextState: Readonly<S>,
    nextContext: any
  ): void;
  getSnapshotBeforeUpdate?(oldProps: Readonly<P>, oldState: Readonly<S>): any;
  componentDidUpdate?(
    previousProps: Readonly<P>,
    previousState: Readonly<S>,
    snapshot: any
  ): void;
  componentDidCatch?(error: any): void;
  _dirty?: boolean;
  _lastLifeCycleMethod?: LifeCycleCallbacks;
}

export function enqueueRender(c: Component) {
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
