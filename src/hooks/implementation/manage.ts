import type { Component, EffectsDictionary } from "../../component";
import config, {
  HAS_RAF,
  addPluginCallback,
  defer,
  reqAnimFrame,
} from "../../config";

let hookIndex = 0;

let hookCandidate: Component = null;

export const rafPendingCallbacks: EffectsDictionary[] = [];
export const layoutPendingCallbacks: EffectsDictionary[] = [];

export function runEffectCleanup(effect: EffectsDictionary[0]) {
  // only called if the effect itself returns a function
  const cl = effect.cleanUp;
  if (typeof cl === "function") {
    cl();
    effect.cleanUp = null;
  }
}

export function runHookEffectAndAssignCleanup(effect: EffectsDictionary[0]) {
  let ret = effect.cb;
  if (ret && typeof (ret = ret()) === "function") {
    effect.cleanUp = ret;
  }
  // make sure we can't run this effect again
  effect.resolved = true;
  effect.cb = null;
}
export function effectCbHandler(effect: EffectsDictionary[0]) {
  // we run this cleanup first to ensure any older effect has been successfully completed
  // an effect will be completed when both it's callback and it's cleanup (if provided have been finished)
  // only run cleanup on unresolved effects
  // i.e effects that have their dependency arrays updated
  effect.resolved || runEffectCleanup(effect);
  runHookEffectAndAssignCleanup(effect);
}

function _runEffect(arr: EffectsDictionary[]) {
  arr.forEach((x) => {
    for (const i in x) {
      const value = x[i];
      effectCbHandler(value);
    }
  });
}
function useEffectCallbacks() {
  return _runEffect(rafPendingCallbacks);
}

//sync
function layoutEffectCallbacks() {
  return _runEffect(layoutPendingCallbacks);
}
const effectScheduler = HAS_RAF ? reqAnimFrame : defer;

function diffEnd() {
  const scheduler = config.debounceEffect || effectScheduler;
  layoutEffectCallbacks();
  scheduler(useEffectCallbacks);
}

function prepForNextHookCandidate(c: Component) {
  hookCandidate = c;
  hookIndex = 0;

  // initialize hooks data if this is the first render
  c && (c._hooksData || (c._hooksData = []));
}

export function getHookStateAtCurrentRender(): [Component, number] {
  if (hookCandidate == null)
    throw new Error(
      "Hook candidate not found, make sure you're running hooks inside a component"
    );
  return [hookCandidate, hookIndex++];
}
// todo manage sideEffects
addPluginCallback({
  _hookSetup: prepForNextHookCandidate,
  diffEnd,
});
