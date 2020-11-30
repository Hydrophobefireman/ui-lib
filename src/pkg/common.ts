import { VNode } from "../types/internal";
import { cloneElement } from "../clone_element";
import { createElement } from "../create_element";
import { flattenArray } from "../util";

const ignore = ["boolean", "string", "number"];
export function createElementIfNeeded(x: any, props?: any): VNode {
  if (x == null || ignore.indexOf(typeof x) > -1) return x;
  if ((x as VNode).constructor === undefined) return recursivelyCloneVNode(x);
  return createElement(x, props);
}
function recursivelyCloneVNode(x: VNode) {
  x = cloneElement(x);
  const children = x.props.children;
  children &&
    ((x.props as any).children = flattenArray(
      [children],
      createElementIfNeeded
    ));
  return x;
}
