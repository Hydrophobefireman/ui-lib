import type {Props, VNode} from "./types/index.js";
import {assign, createElementChildren, objectWithoutKeys} from "./util.js";
import {getVNode, skipProps} from "./create_element.js";

export function cloneElement<P = {}>(
  VNode: VNode<P>,
  props?: Props<P>
): VNode<P> {
  if (!VNode) return null;
  const overrides = props;
  const hasKey = !!overrides && "key" in overrides;
  const hasRef = !!overrides && "ref" in overrides;
  props = assign({}, VNode.props, overrides);
  if (arguments.length > 2)
    (props as any).children = createElementChildren(arguments);
  else if (!overrides || overrides.children === undefined) {
    // Passing route/loader props without children must not erase the cloned
    // VNode's original children.
    (props as any).children = VNode.props.children;
  }
  let normalizedProps: Props<P> = objectWithoutKeys(
    props,
    skipProps
  ) as Props<P>;
  return getVNode<P, unknown>(
    VNode.type,
    normalizedProps,
    hasKey ? overrides.key : VNode.key,
    hasRef ? overrides.ref : VNode.ref
  );
}
