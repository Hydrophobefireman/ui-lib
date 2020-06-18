import { Fragment } from "./create_element";

type anyFunc<T> = (...args: T[]) => T;

export const HAS_PROMISE = typeof Promise !== "undefined";

export const defer: <T>(cb: () => T) => Promise<T> = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : <T>(f: () => T) => setTimeout(f);

export const HAS_RAF = typeof requestAnimationFrame === "function";

export const plugins = {
  hookSetup: Fragment,
  diffed: Fragment,
};

type PluginCallbacks = keyof typeof plugins;

export function addPluginCallback(
  type: PluginCallbacks,
  cb: anyFunc<any>
): void {
  let oldType: anyFunc<any> = plugins[type];
  if (oldType === Fragment) oldType = null;
  plugins[type] = function () {
    oldType && oldType.apply(0, arguments);
    cb.apply(0, arguments);
  };
}

const config = {
  scheduleRender: HAS_RAF
    ? (cb: FrameRequestCallback) => requestAnimationFrame(cb)
    : defer,
  eagerlyHydrate: true,
  RAF_TIMEOUT: 100,
  debounceEffect: null,
};

export default config;
