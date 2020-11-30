import { DOMOps, DiffMeta } from "./types/internal";
import { HAS_PROMISE, defer, plugins } from "./config";
import {
  LIFECYCLE_DID_MOUNT,
  LIFECYCLE_DID_UPDATE,
  LifeCycleCallbacks,
} from "./constants";

import { Component } from "./component";
import { commitDOMOps } from "./commit";
import { unmount } from "./diff/unmount";

type ProcessOptions = {
  name: LifeCycleCallbacks;
  bind: Component;
  args?: any[];
};
const mountCallbackQueue: ProcessOptions[] = [];
const updateCallbackQueue: ProcessOptions[] = [];

function processLifeCycleQueue(obj: ProcessOptions[]): void {
  let cbObj: ProcessOptions;
  while ((cbObj = obj.pop())) {
    __executeCallback(cbObj);
  }
}

export function scheduleLifeCycleCallbacks(options: ProcessOptions): any {
  const name = options.name;
  if (name === LIFECYCLE_DID_MOUNT) return mountCallbackQueue.push(options);
  else if (name === LIFECYCLE_DID_UPDATE)
    return updateCallbackQueue.push(options);
  else __executeCallback(options);
}

function __executeCallback(cbObj: ProcessOptions) {
  const fName = cbObj.name;
  const component = cbObj.bind;
  const func = component[fName];
  plugins.lifeCycle(fName, component);
  component._lastLifeCycleMethod = fName;
  if (!func) return;

  const args = cbObj.args;
  const hasCatch = typeof component.componentDidCatch == "function";

  try {
    func.apply(component, args);
  } catch (e) {
    const b = [];
    const m: DiffMeta = { batch: b } as any;
    if (hasCatch) return component.componentDidCatch(e);
    unmount(component._VNode, m);
    commitDOMOps(b);
    console.error(e);
  }
}

export function onDiff(queue: DOMOps[]) {
  commitDOMOps(queue);
  plugins.diffEnd();
  processLifeCycleQueue(mountCallbackQueue);
  processLifeCycleQueue(updateCallbackQueue);
}
