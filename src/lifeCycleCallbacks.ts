import config from "./config";
import { Component } from "./component";
type ProcessOptions = {
  name: Component["_lastLifeCycleMethod"];
  bind: Component;
  args?: any[];
};
export const mountCallbackQueue: ProcessOptions[] = [];
export function processMountsQueue(): void {
  let cbObj: ProcessOptions;
  while ((cbObj = mountCallbackQueue.pop())) {
    __executeCallback(cbObj);
  }
}

export function scheduleLifeCycleCallbacks(options: ProcessOptions): void {
  if (options.name === "componentDidMount") {
    mountCallbackQueue.push(options);
  } else __executeCallback(options);
}

function __executeCallback(cbObj: ProcessOptions) {
  const args = cbObj.args;
  const component = cbObj.bind;
  const fName = cbObj.name;
  component._lastLifeCycleMethod = fName;
  const func = component[fName];
  Promise.resolve()
    .then(() => func && func.apply(component, args))
    .catch((error) => component.componentDidCatch(error));
}
