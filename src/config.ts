import { Fragment } from "./create_element";

type anyFunc<T> = (...args: T[]) => T;
type configType = {
  deferImplementation<T>(fn: anyFunc<T>): Promise<T>;
  scheduleRender(cb: anyFunc<any>): any;
  eagerlyHydrate: boolean;
};

export const HAS_PROMISE = typeof Promise !== "undefined";
const HAS_RAF = typeof requestAnimationFrame !== "undefined";
const DEFAULT_FUNC = setTimeout;

const defaultRenderDeferrer = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : DEFAULT_FUNC;

const config: configType = {
  deferImplementation: defaultRenderDeferrer,
  scheduleRender: HAS_RAF ? reqAnimFrame : defaultRenderDeferrer,
  eagerlyHydrate: true,
};

function reqAnimFrame(cb: FrameRequestCallback) {
  return requestAnimationFrame(cb);
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
