import { Component } from "./component";
import { Fragment, LifeCycleCallbacks } from "./constants";
import { Props, UIElement, VNode } from "./types/index";

export const HAS_PROMISE = typeof Promise !== "undefined";

export const defer: <T>(cb: () => T) => Promise<T> = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : <T>(f: () => T) => setTimeout(f);

export const HAS_RAF = typeof requestAnimationFrame === "function";

export interface IPlugins {
  createElement(VNode: VNode): void;
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
    let oldType = plugins[type];
    plugins[type] = function () {
      oldType.apply(0, arguments);
      cb.apply(0, arguments);
    };
  }
}

export function reqAnimFrame(cb: () => void) {
  const done: FrameRequestCallback = (e) => {
    cancelAnimationFrame(raf);
    clearTimeout(timeout);
    cb();
  };
  let raf: number;
  let timeout: NodeJS.Timeout;
  timeout = setTimeout(done, config.RAF_TIMEOUT);
  raf = requestAnimationFrame(done);
}

const config = {
  scheduleRender: HAS_RAF ? reqAnimFrame : defer,
  warnOnUnmountRender: false,
  RAF_TIMEOUT: 100,
  debounceEffect: null,
  inMemoryRouter: false,
  memoryRouteStore: localStorage,
  unmountOnError: true,
};

export default config;
