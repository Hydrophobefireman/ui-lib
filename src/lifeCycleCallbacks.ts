import { Component } from "./component";
import { HAS_PROMISE, plugins } from "./config";
import { DOMOps } from "./types";
import { commitDOMOps } from "./commit";

type ProcessOptions = {
  name: Component["_lastLifeCycleMethod"];
  bind: Component;
  args?: any[];
};
const mountCallbackQueue: ProcessOptions[] = [];
const updateCallbackQueue: ProcessOptions[] = [];

export function processMountsQueue(): void {
  processLifeCycleQueue(mountCallbackQueue);
}
export function processUpdatesQueue(): void {
  processLifeCycleQueue(updateCallbackQueue);
}
function processLifeCycleQueue(obj: ProcessOptions[]): void {
  let cbObj: ProcessOptions;
  while ((cbObj = obj.pop())) {
    __executeCallback(cbObj);
  }
}

export function scheduleLifeCycleCallbacks(options: ProcessOptions): any {
  const name = options.name;
  if (name === "componentDidMount") return mountCallbackQueue.push(options);
  else if (name === "componentDidUpdate")
    return updateCallbackQueue.push(options);
  else __executeCallback(options);
}

function __executeCallback(cbObj: ProcessOptions) {
  const args = cbObj.args;
  const component = cbObj.bind;
  const fName = cbObj.name;
  component._lastLifeCycleMethod = fName;
  const func = component[fName];
  const hasCatch = !!component.componentDidCatch;
  if (!func) return;
  const cb = () => func.apply(component, args);
  if (HAS_PROMISE) {
    Promise.resolve()
      .then(cb)
      .catch((error) => {
        if (hasCatch) return component.componentDidCatch(error);
        throw error;
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
  processMountsQueue();
  processUpdatesQueue();
}
