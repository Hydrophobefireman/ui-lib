import { createElement } from "../create_element";
import { VNode } from "../types";

export function createElementIfNeeded(x: any, props?: any): VNode {
  if (x == null) return x;
  if ((x as VNode).__self) return x;
  return createElement(x, props);
}
