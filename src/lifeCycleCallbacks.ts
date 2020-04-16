import { Component } from "./component";
type ProcessOptions = {
  name: Component["_lastLifeCycleMethod"];
  bind: Component;
  args?: any[];
};
const mountCallbackQueue: ProcessOptions[] = [];
const updateCallbackQueue: ProcessOptions[] = [];

export function processMountsQueue(): void {
  processQueue(mountCallbackQueue);
}
export function processUpdatesQueue(): void {
  processQueue(updateCallbackQueue);
}
function processQueue(obj: ProcessOptions[]): void {
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

const HAS_PROMISE = typeof Promise !== "undefined";
function __executeCallback(cbObj: ProcessOptions) {
  const args = cbObj.args;
  const component = cbObj.bind;
  const fName = cbObj.name;
  component._lastLifeCycleMethod = fName;
  const func = component[fName];
  const hasCatch = !!component.componentDidCatch;

  if (HAS_PROMISE) {
    Promise.resolve()
      .then(() => func && func.apply(component, args))
      .catch((error) => {
        if (hasCatch) return component.componentDidCatch(error);
        throw error;
      });
  } else {
    try {
      func.apply(component, args);
    } catch (e) {
      if (hasCatch) return component.componentDidCatch(e);
      throw e;
    }
  }
}
