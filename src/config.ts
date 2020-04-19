type anyFunc<T> = (...args: T[]) => T;
type configType = {
  deferImplementation<T>(fn: anyFunc<T>): Promise<T>;
  scheduleRender(cb: anyFunc<any>): any;
  eagerlyHydrate: boolean;
  beforeHookRender: anyFunc<any>;
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
  beforeHookRender: null,
};

function reqAnimFrame(cb: FrameRequestCallback) {
  return requestAnimationFrame(cb);
}
export default config;

export function addPluginCallback<T>(
  type: "beforeHookRender",
  cb: anyFunc<any>
): void {
  if (type in config) {
    const oldType: anyFunc<any> = config[type];
    config[type] = function () {
      cb.apply(null, arguments);
      oldType && oldType(null, arguments);
    };
  }
}
