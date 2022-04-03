import {Component} from "./component";
import config, {plugins} from "./config";
import {
  LIFECYCLE_DID_MOUNT,
  LIFECYCLE_DID_UPDATE,
  LifeCycleCallbacks,
} from "./constants";
import {unmount} from "./diff/unmount";

type ProcessOptions = {
  name: LifeCycleCallbacks;
  bind: Component;
  args?: any[];
};
const mountCallbackQueue: ProcessOptions[] = [];
const updateCallbackQueue: ProcessOptions[] = [];

function processLifeCycleQueue(obj: ProcessOptions[]): void {
  const clone = obj.splice(0);

  clone.forEach(__executeCallback);
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
  const cb = () => func.apply(component, args);
  function handleError(e: Error) {
    if (hasCatch) return component.componentDidCatch(e);
    if (config.unmountOnError) {
      unmount(component._VNode);
    }
    throw e;
  }
  try {
    const ret = cb();
    if (ret && ret.then && ret.catch) {
      ret.catch(handleError);
    }
  } catch (e) {
    handleError(e);
  }
}

export function onDiff() {
  plugins.diffEnd();
  // run syncrhonously
  // defer(() => {
  processLifeCycleQueue(mountCallbackQueue);
  processLifeCycleQueue(updateCallbackQueue);
  // });
}
