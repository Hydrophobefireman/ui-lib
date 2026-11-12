import type {
  Component,
  EffectsDictionary,
  PendingEffects,
} from "../../component.js";
import config from "../../config.js";
import {$push} from "../../util.js";
import {
  getHookStateAtCurrentRender,
  layoutPendingCallbacks,
  removePendingEffects,
  runEffectCleanup,
} from "./manage.js";
import {argsChanged, getCurrentHookValueOrSetDefault} from "./util.js";

function unmount(this: Component) {
  const pending = this._pendingEffects;
  const seen = new Set<EffectsDictionary[0]>();

  const cleanupRecord = (effect: EffectsDictionary[0]) => {
    if (!effect || seen.has(effect)) return;
    seen.add(effect);
    effect.disposed = true;
    effect.cb = null;
    effect.resolved = true;
    runEffectCleanup(effect);
  };

  const cleanupDictionary = (effects: EffectsDictionary) => {
    for (const i in effects) cleanupRecord(effects[i]);
  };

  if (pending) {
    // Queued work that has not run yet must never run after unmount.
    cleanupDictionary(pending.sync);
    cleanupDictionary(pending.async);
    removePendingEffects(pending.sync);
    removePendingEffects(pending.async);
  }
  // Effects that already ran are no longer pending but still own a cleanup.
  const hooks = this._hooksData;
  if (hooks) {
    for (const hook of hooks) {
      if (hook && hook.effect) cleanupRecord(hook.effect);
    }
  }
  this._pendingEffects = null;
}
export function effect(
  callback: () => (() => unknown) | unknown,
  dependencies: unknown[],
  arr: EffectsDictionary[]
) {
  if (config.isSSR) return;
  const which = arr === layoutPendingCallbacks ? "sync" : "async";
  const state = getHookStateAtCurrentRender();

  const candidate = state[0];
  const hookIndex = state[1];

  const hookData = candidate._hooksData;

  const currentHook = getCurrentHookValueOrSetDefault(
    hookData,
    hookIndex,
    () => ({})
  );

  const instanceEffects: PendingEffects = (candidate._pendingEffects =
    candidate._pendingEffects || {
      sync: {},
      async: {},
    });
  const pending = instanceEffects[which];

  const oldEffect = currentHook.effect as EffectsDictionary[0];
  if (!argsChanged(currentHook.args, dependencies)) {
    // Unchanged dependencies keep the existing pending/mounted effect.
    return;
  }

  currentHook.args = dependencies;

  // If the previous callback never ran there is nothing to clean up. If it did
  // run, carry its cleanup forward so it executes immediately before the next
  // callback instead of running user code during render.
  const cleanUp = oldEffect ? oldEffect.cleanUp : null;
  if (oldEffect) oldEffect.disposed = true;

  const effectRecord: EffectsDictionary[0] = {
    cb: callback,
    cleanUp,
    resolved: false,
    disposed: false,
  };
  currentHook.effect = effectRecord;
  pending[hookIndex] = effectRecord;
  $push(arr, pending);

  if (!(candidate as any).__attachedUnmount) {
    (candidate as any).__attachedUnmount = true;

    const old = candidate.componentWillUnmount;
    if (!old) {
      candidate.componentWillUnmount = unmount;
    } else {
      candidate.componentWillUnmount = function () {
        old.call(candidate);
        unmount.call(candidate);
      };
    }
  }
}
