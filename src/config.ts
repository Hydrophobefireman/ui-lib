import { VNode, UIElement, Props } from "./types/index";
import { Component } from "./component";
import { LifeCycleCallbacks, Fragment } from "./constants";

export const HAS_PROMISE = typeof Promise !== "undefined";

export const defer: <T>(cb: () => T) => Promise<T> = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : <T>(f: () => T) => setTimeout(f);

export const HAS_RAF = typeof requestAnimationFrame === "function";

export interface IPlugins {
  createElement(VNode: VNode): void;
  hookSetup(c: Component): void;
  diffEnd(): void;
  diffStart(thisVal: Component, force: boolean): void;
  lifeCycle(cb: LifeCycleCallbacks, component: Component): void;
  domNodeCreated(dom: UIElement, VNode: VNode): void;
  componentInstance(thisVal: Component, props: Props<any>): void;
}
export const plugins: IPlugins = {
  createElement: Fragment,
  hookSetup: Fragment,
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

const config = {
  scheduleRender: HAS_RAF
    ? (cb: FrameRequestCallback) => requestAnimationFrame(cb)
    : defer,
  warnOnUnmountRender: false,
  RAF_TIMEOUT: 100,
  debounceEffect: null,
  inMemoryRouter: false,
};

export default config;
