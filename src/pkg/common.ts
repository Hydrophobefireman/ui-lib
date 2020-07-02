import { VNode } from "../types/index";
import { createElement } from "../create_element";

const ignore = ["boolean", "string", "number"];
export function createElementIfNeeded(x: any, props?: any): VNode {
  if (x == null || ignore.indexOf(typeof x) > -1) return x;
  if ((x as VNode).constructor === undefined) return x;
  return createElement(x, props);
}
