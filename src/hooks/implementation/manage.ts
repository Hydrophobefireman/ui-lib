import type {Component, EffectsDictionary} from "../../component.js";
import config, {
  HAS_RAF,
  addPluginCallback,
  defer,
  reqAnimFrame,
} from "../../config.js";

let hookIndex = 0;

let hookCandidate: Component = null;

export const rafPendingCallbacks: EffectsDictionary[] = [];
export const layoutPendingCallbacks: EffectsDictionary[] = [];

export function runEffectCleanup(effect: EffectsDictionary[0]) {
  // Clear the pointer before invoking user code so a throwing cleanup cannot
  // leave stale bookkeeping behind or run twice.
  const cl = effect.cleanUp;
  effect.cleanUp = null;
  if (typeof cl === "function") cl();
}

export function runHookEffectAndAssignCleanup(effect: EffectsDictionary[0]) {
  const cb = effect.cb;
  effect.cb = null;
  effect.resolved = true;
  if (!cb) return;
  const ret = cb();
  if (typeof ret === "function") effect.cleanUp = ret;
}
export function effectCbHandler(effect: EffectsDictionary[0]) {
  if (!effect || effect.disposed) return;
  // A cleanup inherited from the previous run always precedes the new callback.
  runEffectCleanup(effect);
  runHookEffectAndAssignCleanup(effect);
}

function _runEffect(arr: EffectsDictionary[]) {
  // Drain a snapshot. Work scheduled by an effect during this flush stays in
  // `arr` for the next flush instead of being discarded.
  const snapshots = arr.splice(0);
  const pending: EffectsDictionary[0][] = [];
  for (const effects of snapshots) {
    for (const i in effects) {
      // Remove pending work from the instance dictionary. The record itself
      // remains reachable from the hook for unmount cleanup. Detach all records
      // before user code can enqueue new work in the same dictionaries.
      pending.push(effects[i]);
      delete effects[i];
    }
  }
  let failed = false;
  let firstError: unknown;
  for (const effect of pending) {
    try {
      effectCbHandler(effect);
    } catch (error) {
      // Finish draining independent effects, but still report the first error.
      // A throwing cleanup must not leave an unqueued callback retained either.
      effect.cb = null;
      effect.resolved = true;
      if (!failed) firstError = error;
      failed = true;
    }
  }
  if (failed) throw firstError;
}
function useEffectCallbacks() {
  return _runEffect(rafPendingCallbacks);
}

//sync
function layoutEffectCallbacks() {
  return _runEffect(layoutPendingCallbacks);
}
const effectScheduler = HAS_RAF ? reqAnimFrame : defer;
let passiveFlushScheduled = false;

function schedulePassiveEffects() {
  if (passiveFlushScheduled) return;
  passiveFlushScheduled = true;
  const scheduler = config.debounceEffect || effectScheduler;
  scheduler(() => {
    passiveFlushScheduled = false;
    useEffectCallbacks();
  });
}

/** Remove an instance's pending dictionary from both global queues. */
export function removePendingEffects(pending: EffectsDictionary) {
  if (!pending) return;
  for (const arr of [layoutPendingCallbacks, rafPendingCallbacks]) {
    const index = arr.indexOf(pending);
    if (index > -1) arr.splice(index, 1);
  }
}

function diffEnd() {
  layoutEffectCallbacks();
  if (rafPendingCallbacks.length) schedulePassiveEffects();
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
