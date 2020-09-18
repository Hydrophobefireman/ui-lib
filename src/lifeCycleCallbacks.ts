import { HAS_PROMISE, defer, plugins } from "./config";
import {
  LIFECYCLE_DID_MOUNT,
  LIFECYCLE_DID_UPDATE,
  LifeCycleCallbacks,
} from "./constants";

import { Component } from "./component";
import { DOMOps } from "./types/index";
import { commitDOMOps } from "./commit";

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
  const cb = (): void => func.apply(component, args);
  if (HAS_PROMISE) {
    defer(cb).catch((error: Error) => {
      if (hasCatch) {
        component.componentDidCatch(error);
      } else {
        throw error;
      }
    });
  } else {
    try {
      cb();
    } catch (e) {
      if (hasCatch) return component.componentDidCatch(e);
      throw e;
    }
  }
}

export function onDiff(queue: DOMOps[]) {
  commitDOMOps(queue);
  plugins.diffEnd();
  processLifeCycleQueue(mountCallbackQueue);
  processLifeCycleQueue(updateCallbackQueue);
}
