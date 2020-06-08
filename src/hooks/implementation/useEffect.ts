import {
  rafPendingCallbacks,
  getHookStateAtCurrentRender,
  runCleanup,
  effectCbHandler,
} from "./manage";
import {
  argsChanged,
  getCurrentHookValueOrSetDefault,
  HookDefault,
} from "./util";
import { Component } from "../../component";
import { EMPTY_OBJ } from "../../util";

function unmount() {
  const pending = (this as Component)._pendingEffects;
  for (const effect in pending || EMPTY_OBJ) {
    runCleanup(pending[effect]);
  }
  (this as Component)._pendingEffects = null;
}

export function useEffect(callback: () => void, dependencies: any[]): void {
  const hookArgs = {
    hookState: callback,
  };
  const state = getHookStateAtCurrentRender();

  const candidate = state[0];
  const hookIndex = state[1];

  const hookData = candidate._hooksData;

  let currentHook = hookData[hookIndex] || <HookDefault>{};

  if (!argsChanged(currentHook.args, dependencies)) return;

  currentHook = getCurrentHookValueOrSetDefault(
    hookData,
    hookIndex,
    () => hookArgs
  );
  currentHook.args = dependencies;

  const pending = (candidate._pendingEffects = candidate._pendingEffects || {});

  const old = pending[hookIndex] || ({} as typeof pending[0]);

  effectCbHandler(old);

  pending[hookIndex] = {
    cb: callback,
    cleanUp: old.cleanUp,
  };

  rafPendingCallbacks.push(candidate);

  candidate.componentWillUnmount = unmount;
}
