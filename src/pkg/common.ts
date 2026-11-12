import type {ComponentChildren, VNode} from "../types/index.js";
import {createElement} from "../create_element.js";
import {cloneElement} from "../clone_element.js";
import {flattenArray} from "../util.js";

const ignore = ["boolean", "string", "number"];
export function createElementIfNeeded(x: any, props?: any): VNode {
  if (x == null || ignore.indexOf(typeof x) > -1) return x;
  if ((x as VNode).constructor === undefined)
    return recursivelyCloneVNode(x, props);
  return createElement(x, props);
}
function recursivelyCloneVNode(x: VNode, props?: any) {
  let children: ComponentChildren;
  (children = (x = cloneElement(x, props)).props.children) &&
    ((x.props as any).children = flattenArray(
      [children],
      createElementIfNeeded
    ));
  return x;
}
