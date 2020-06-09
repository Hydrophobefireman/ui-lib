import { Component } from "../../component";
import config, { addPluginCallback } from "../../config";

type PendingEffects = Component["_pendingEffects"];

let hookIndex = 0;

let hookCandidate: Component = null;

export const rafPendingCallbacks: PendingEffects[] = [];

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
  runEffectCleanup(effect);
  runHookEffectAndAssignCleanup(effect);
}
function scheduleEffects() {
  rafPendingCallbacks.forEach((x) => {
    for (const i in x) {
      const value = x[i];
      effectCbHandler(value);
    }
  });
  rafPendingCallbacks.length = 0;
}

function setEffectiveCallbacks() {
  config.scheduleRender(scheduleEffects);
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
addPluginCallback("hookSetup", prepForNextHookCandidate);
addPluginCallback("diffed", setEffectiveCallbacks);

export function $push(x: PendingEffects) {
  rafPendingCallbacks.indexOf(x) === -1 && rafPendingCallbacks.push(x);
}
