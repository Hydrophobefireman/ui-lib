import { Component } from "../../component";
import config, { addPluginCallback } from "../../config";

let hookIndex = 0;

let hookCandidate: Component = null;

export const rafPendingCallbacks: Component[] = [];

export function runCleanup(effect: Component["_pendingEffects"][0]) {
  const cl = effect.cleanUp;
  if (typeof cl === "function") {
    cl();
    effect.cleanUp = null;
  }
}
function effectCbHandler(effect: Component["_pendingEffects"][0]) {
  runCleanup(effect);
  let ret = effect.cb;
  if (ret && typeof (ret = ret()) === "function") {
    effect.cleanUp = ret;
  }
  effect.cb = null;
}

function scheduleEffects() {
  rafPendingCallbacks.forEach((x) => {
    const pending = x._pendingEffects;
    for (const i in pending) {
      const value = pending[i];
      effectCbHandler(value);
      value.cleanUp;
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

addPluginCallback("hookSetup", prepForNextHookCandidate);
addPluginCallback("diffed", setEffectiveCallbacks);
