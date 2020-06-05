import {
  rafPendingCallbacks,
  getHookStateAtCurrentRender,
  runCleanup,
} from "./manage";
import { argsChanged, getCurrentHookValueOrSetDefault } from "./util";
import { Component } from "../../component";
import { EMPTY_OBJ } from "../../util";

function unmount() {
  const pending = (this as Component)._pendingEffects;
  for (const effect in pending || EMPTY_OBJ) {
    runCleanup(pending[effect]);
  }
  (this as Component)._pendingEffects = null;
}

export function useEffect(callback: () => void, dependencies: any[]) {
  const state = getHookStateAtCurrentRender();

  const candidate = state[0];
  const hookIndex = state[1];

  const hookData = candidate._hooksData;

  let currentHook = hookData[hookIndex] || <any>{};
  if (!argsChanged(currentHook.args, dependencies)) return;

  currentHook = getCurrentHookValueOrSetDefault(hookData, hookIndex, () => ({
    args: dependencies,
    hookState: callback,
  }));
  const pending = (candidate._pendingEffects = candidate._pendingEffects || {});

  const old = pending[hookIndex];

  pending[hookIndex] = { cb: callback, cleanUp: old && old.cleanUp };

  rafPendingCallbacks.push(candidate);

  candidate.componentWillUnmount = unmount;
}
