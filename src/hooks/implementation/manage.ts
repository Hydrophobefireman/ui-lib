import config, { HAS_RAF, addPluginCallback, defer } from "../../config";

import { Component } from "../../component";

/**
 * This ensures that we begin our render work  even if we don't get an animation frame for 100ms
 * this could happen in cases like we're in an inactive tab
 * but we need to render the component and it's children
 * as we might delay some side effects
 * however if the user wishes to have the rendering stop until the tab is active
 * they can set `config.scheduleRender` to `requestAnimationFrame`
 */
function reqAnimFrame(cb: () => void) {
  const done = () => {
    cancelAnimationFrame(raf);
    clearTimeout(timeout);
    cb();
  };
  let raf: number;
  let timeout: NodeJS.Timeout;
  timeout = setTimeout(done, config.RAF_TIMEOUT);
  raf = requestAnimationFrame(done);
}

export type PendingEffects = Component["_pendingEffects"];

let hookIndex = 0;

let hookCandidate: Component = null;

export const rafPendingCallbacks: PendingEffects[] = [];
export const layoutPendingCallbacks: PendingEffects[] = [];

export function runEffectCleanup(effect: PendingEffects[0]) {
  // only called if the effect itself returns a function
  const cl = effect.cleanUp;
  if (typeof cl === "function") {
    cl();
    effect.cleanUp = null;
  }
}

export function runHookEffectAndAssignCleanup(effect: PendingEffects[0]) {
  let ret = effect.cb;
  if (ret && typeof (ret = ret()) === "function") {
    effect.cleanUp = ret;
  }
  // make sure we can't run this effect again
  effect.cb = null;
}
export function effectCbHandler(effect: PendingEffects[0]) {
  // we run this cleanup first to ensure any older effect has been successfully completed
  // an effect will be completed when both it's callback and it's cleanup (if provided have been finished)
  // only run cleanup on unresolved effects
  // i.e effects that have their dependency arrays updated
  effect.resolved || runEffectCleanup(effect);
  runHookEffectAndAssignCleanup(effect);
}

function _runEffect(arr: PendingEffects[]) {
  arr.forEach((x) => {
    for (const i in x) {
      const value = x[i];
      effectCbHandler(value);
    }
  });
}
function scheduleUseEffectCallbacks() {
  return _runEffect(rafPendingCallbacks);
}

//sync
function scheduleLayoutEffectCallbacks() {
  return _runEffect(layoutPendingCallbacks);
}
const effectScheduler =
  config.debounceEffect || (HAS_RAF ? reqAnimFrame : defer);

function diffEnd() {
  scheduleLayoutEffectCallbacks();
  effectScheduler(scheduleUseEffectCallbacks);
}

function prepForNextHookCandidate(c: Component) {
  hookCandidate = c;
  hookIndex = 0;

  // initialize hooks data if this is the first render
  c && (c._hooksData || (c._hooksData = []));
}

export function getHookStateAtCurrentRender(): [Component, number] {
  return [hookCandidate, hookIndex++];
}
// todo manage sideEffects
addPluginCallback({
  hookSetup: prepForNextHookCandidate,
  diffEnd,
});
