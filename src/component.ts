import config, {plugins} from "./config.js";
import {RENDER_MODE_CLIENT} from "./constants.js";
import type {LifeCycleCallbacks} from "./constants.js";
import {diff} from "./diff/index.js";
import {onDiff} from "./lifeCycleCallbacks.js";
import type {
  ComponentChild,
  Props,
  UIElement,
  VNode,
  setStateArgType,
  ContextProvider,
} from "./types/index.js";
import {assign} from "./util.js";

const RENDER_QUEUE: Component[] = [];
export interface EffectsDictionary {
  [index: number]: {
    cb: () => any;
    cleanUp?: () => any;
    resolved?: boolean;
    /** queued work was superseded or unmounted */
    disposed?: boolean;
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
  _hooksData?: {
    args?: any;
    hookState?: any;
    reducer?: any;
    effect?: any;
  }[];
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
  _sharedContext?: {[id: string]: ContextProvider};
  // provider this component (or its contextType) is subscribed to
  _contextProvider?: ContextProvider;
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

  forceUpdate(callback?: (() => void) | false, queuedUpdatate?: boolean): void {
    if (this._VNode == null) return;
    // isolatedForceUpdate (when the user calls it)
    // in other cases, we batch it among with other components as well, this fixes
    // a few race condition bugs that were caused by deferring the update
    // and runs them synchronously instead
    const shouldForce = callback !== false;
    const isIsolatedForceUpdate = queuedUpdatate !== true;
    plugins.diffStart(this, shouldForce);

    diff(
      this._VNode,
      assign({}, this._VNode),
      this._VNode._parentDom,
      shouldForce,
      {
        depth: this._depth,
        isSvg: false,
        context: this._sharedContext || {},
        mode: RENDER_MODE_CLIENT,
      }
    ) as UIElement;
    typeof callback === "function" && callback();
    isIsolatedForceUpdate && onDiff();
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
  if (c._dirty) return;
  c._dirty = true;
  if (RENDER_QUEUE.push(c) === 1) {
    config.scheduleRender(process);
  }
}

function process() {
  let p: Component;
  // _depth is larger for descendants. Sorting descending and popping from the
  // end processes parents before children deterministically.
  RENDER_QUEUE.sort((x, y) => y._depth - x._depth);
  while ((p = RENDER_QUEUE.pop())) {
    if (p._dirty) {
      p._dirty = false;
      p.forceUpdate(false, true);
    }
  }
  onDiff();
}
