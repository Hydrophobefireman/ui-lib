type anyFunc<T> = (...args: T[]) => T;
type configType = {
  deferImplementation<T>(fn: anyFunc<T>): Promise<T>;
  scheduleRender(cb: anyFunc<any>): any;
};

const HAS_PROMISE = typeof Promise !== "undefined";
const HAS_RAF = typeof requestAnimationFrame !== "undefined";
const DEFAULT_FUNC = setTimeout;

const defaultRenderDeferrer = HAS_PROMISE
  ? Promise.prototype.then.bind(Promise.resolve())
  : DEFAULT_FUNC;

const config: configType = {
  deferImplementation: defaultRenderDeferrer,
  scheduleRender: HAS_RAF ? reqAnimFrame : defaultRenderDeferrer,
};

function reqAnimFrame(cb: FrameRequestCallback) {
  return requestAnimationFrame(cb);
}
export default config;
