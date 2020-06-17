import { Fragment } from "./create_element";

type anyFunc<T> = (...args: T[]) => T;

export const HAS_PROMISE = typeof Promise !== "undefined";

export const defer: <T>(cb: () => T) => Promise<T> = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : <T>(f: () => T) => setTimeout(f);

export const HAS_RAF = typeof requestAnimationFrame == "function";
const config = {
  scheduleRender: HAS_RAF
    ? (cb: FrameRequestCallback) => requestAnimationFrame(cb)
    : defer,
  eagerlyHydrate: true,
  RAF_TIMEOUT: 100,
};

/**
 * This ensures that we begin our render work  even if we don't get an animation frame for 100ms
 * this could happen in cases like we're in an inactive tab
 * but we need to render the component and it's children
 * as we might delay some side effects
 * however if the user wishes to have the rendering stop until the tab is active
 * they can set `config.scheduleRender` to `requestAnimationFrame`
 */
export function reqAnimFrame(cb: () => void) {
  const done = () => {
    cancelAnimationFrame(raf);
    setTimeout(cb);
    clearTimeout(timeout);
  };
  let raf: number;
  let timeout: NodeJS.Timeout;
  timeout = setTimeout(done, config.RAF_TIMEOUT);
  raf = requestAnimationFrame(done);
}

export default config;

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
