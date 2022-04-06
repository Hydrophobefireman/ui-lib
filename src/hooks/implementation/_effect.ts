import type {
  Component,
  EffectsDictionary,
  PendingEffects,
} from "../../component";
import config from "../../config";
import {EMPTY_OBJ} from "../../constants";
import {$push} from "../../util";
import {
  getHookStateAtCurrentRender,
  layoutPendingCallbacks,
  runEffectCleanup,
  runHookEffectAndAssignCleanup,
} from "./manage";
import {argsChanged} from "./util";

function _$unmount(pending: EffectsDictionary, $this: Component) {
  for (const effect in pending || EMPTY_OBJ) {
    runEffectCleanup(pending[effect]);
  }
  $this._pendingEffects = null;
}
function unmount(this: Component) {
  const p = this._pendingEffects || EMPTY_OBJ;
  const pending$sync = p.sync;
  const pending$async = p.async;
  _$unmount(pending$sync, this);
  _$unmount(pending$async, this);
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

  let currentHook =
    hookData[hookIndex] || ({} as typeof candidate._hooksData[0]);

  const instanceEffects: PendingEffects = (candidate._pendingEffects =
    candidate._pendingEffects || {
      sync: {},
      async: {},
    });
  const pending = instanceEffects[which];

  const oldEffect = pending[hookIndex];
  if (!argsChanged(currentHook.args, dependencies)) {
    // mark the effect as resolved
    // no cleanup will be performed (except on unmount)
    // @TODO CHECK IF THIS BREAKS ANYTHING
    // I REALLY NEED TO ADD TESTS
    // if (oldEffect) oldEffect.resolved = true;
    return;
  }
  hookData[hookIndex] = currentHook;
  currentHook.args = dependencies;

  // TODO
  // in case we have an unused effect (callback not called yet)
  // attempt to defer the old effect as well, maybe wrap them together in a separate effect
  // as in this case we could end up blocking the render iff -
  // - previous callback hasn't been called yet
  // - previous callback is an expensive function
  // the cleanup does not matter as we will call it right before we call the new effect
  // however it is important that we call the effect right here for now as in the rare event
  // where the callback hasn't been called, we could end up with no cleanup either
  // another approach could be to leave the uncalled function and it's cleanup and start with
  // what we have as the new effect.

  const cleanUp = oldEffect
    ? (runHookEffectAndAssignCleanup(oldEffect) as any as false) ||
      oldEffect.cleanUp
    : null;

  pending[hookIndex] = {
    cb: callback,
    cleanUp,
  };
  // only push effect if we haven't already added it to the queue
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
