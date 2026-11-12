import {Fragment} from "./constants.js";
import type {LifeCycleCallbacks} from "./constants.js";
import type {Component} from "./component.js";
import type {CustomWindow, Props, UIElement, VNode} from "./types/index.js";

export const HAS_PROMISE = typeof Promise !== "undefined";

export const defer = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : <T>(f: () => T) => setTimeout(f);

export const HAS_RAF = typeof requestAnimationFrame === "function";

export interface IPlugins {
  createElement(VNode: VNode, ref: any, key: any): void;
  _hookSetup(c: Component): void;
  diffEnd(): void;
  diffStart(thisVal: Component, force: boolean): void;
  lifeCycle(cb: LifeCycleCallbacks, component: Component): void;
  domNodeCreated(dom: UIElement, VNode: VNode): void;
  componentInstance(thisVal: Component, props: Props<any>): void;
}
export const plugins: IPlugins = {
  createElement: Fragment,
  _hookSetup: Fragment,
  diffStart: Fragment,
  diffEnd: Fragment,
  lifeCycle: Fragment,
  domNodeCreated: Fragment,
  componentInstance: Fragment,
};

export function addPluginCallback(options: Partial<IPlugins>): void {
  for (const type in options) {
    const cb = options[type as keyof IPlugins];
    if (!cb) throw new Error("invalid callback: " + cb);
    const oldType = plugins[type as keyof IPlugins] as (...args: any[]) => any;
    const callback = cb as (...args: any[]) => any;
    plugins[type] = function () {
      oldType.apply(0 as any, arguments as any);
      callback.apply(0 as any, arguments as any);
    };
  }
}
//@safe
export function reqAnimFrame(cb: () => void) {
  const done: FrameRequestCallback = (e) => {
    cancelAnimationFrame(raf);
    clearTimeout(timeout);
    cb();
  };
  let raf: number;
  let timeout = setTimeout(done, config.RAF_TIMEOUT);

  raf = requestAnimationFrame(done);
}

const config = {
  // we set it to null here so that we can inject our own global
  window: typeof window !== "undefined" ? window : (null as CustomWindow),
  scheduleRender: HAS_RAF ? reqAnimFrame : defer,
  warnOnUnmountRender: false,
  RAF_TIMEOUT: 100,
  debounceEffect: null,
  inMemoryRouter: false,
  memoryRouteStore: typeof window !== "undefined" && window.localStorage,
  unmountOnError: true,
  isSSR: typeof window === "undefined",
};

export default config;
