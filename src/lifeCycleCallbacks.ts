import { Component } from "./component";
import { HAS_PROMISE, plugins, defer } from "./config";
import { DOMOps } from "./types/index";
import { commitDOMOps } from "./commit";
import { LIFECYCLE_DID_MOUNT, LIFECYCLE_DID_UPDATE } from "./constants";

type ProcessOptions = {
  name: Component["_lastLifeCycleMethod"];
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
  plugins.diffed();
  processLifeCycleQueue(mountCallbackQueue);
  processLifeCycleQueue(updateCallbackQueue);
}
